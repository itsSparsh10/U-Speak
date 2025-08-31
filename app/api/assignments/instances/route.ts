import { NextRequest, NextResponse } from 'next/server';
import { AssignmentInstance, AssignmentMaster, CorporateAccount, User, EmployeeProfile, EmployeeAttributeValue, CustomAttributeDefinition } from '@/lib/models';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// GET /api/assignments/instances - Get assignment instances for an account
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const status = searchParams.get('status');
    const scope = searchParams.get('scope');
    const all = searchParams.get('all'); // New parameter to fetch all instances
    
    // Allow fetching all instances if 'all=true' is passed, otherwise require accountId
    if (!accountId && !all) {
      return NextResponse.json(
        { success: false, error: 'Account ID is required or use all=true to fetch all instances' },
        { status: 400 }
      );
    }
    
    let query: any = {};
    if (accountId) {
      // Convert string to ObjectId for aggregation
      try {
        query.account_id = new mongoose.Types.ObjectId(accountId);
      } catch (error) {
        return NextResponse.json(
          { success: false, error: 'Invalid account ID format' },
          { status: 400 }
        );
      }
    }
    if (status) query.status = status;
    if (scope) query.assignment_scope = scope;
    
    // Use aggregation to include assigned employee information
    const instances = await AssignmentInstance.aggregate([
      { $match: query },
      // Populate assignment_id
      {
        $lookup: {
          from: 'assignmentmasters',
          localField: 'assignment_id',
          foreignField: '_id',
          as: 'assignment'
        }
      },
      // Populate assigned_by_user_id
      {
        $lookup: {
          from: 'users',
          localField: 'assigned_by_user_id',
          foreignField: '_id',
          as: 'assigned_by_user'
        }
      },
      // Lookup the directly assigned employee (new field)
      {
        $lookup: {
          from: 'employeeprofiles',
          localField: 'assigned_to_employee_id',
          foreignField: '_id',
          as: 'assigned_to_employee'
        }
      },
      // Lookup assigned employees through junction table
      {
        $lookup: {
          from: 'assignmentemployees',
          localField: '_id',
          foreignField: 'instance_id',
          as: 'employee_assignments'
        }
      },
      // Lookup employee profiles
      {
        $lookup: {
          from: 'employeeprofiles',
          localField: 'employee_assignments.employee_id',
          foreignField: '_id',
          as: 'assigned_employee_profiles'
        }
      },
      // Project the final structure
      {
        $project: {
          _id: 1,
          instance_id: 1,
          assignment_id: 1,
          account_id: 1,
          assigned_by_user_id: 1,
          assigned_to_employee_id: 1,
          assigned_to_employee_name: 1,
          deadline: 1,
          assignment_scope: 1,
          status: 1,
          instructions: 1,
          links: 1,
          created_at: 1,
          updated_at: 1,
          __v: 1,
          // Populate assignment details
          assignment_id_populated: { $arrayElemAt: ['$assignment', 0] },
          assigned_by_user: { $arrayElemAt: ['$assigned_by_user', 0] },
          assigned_to_employee: { $arrayElemAt: ['$assigned_to_employee', 0] },
          // Employee assignment details
          total_assigned_employees: { $size: '$assigned_employee_profiles' },
          assigned_employee_profiles: {
            $map: {
              input: '$assigned_employee_profiles',
              as: 'profile',
              in: {
                _id: '$$profile._id',
                user_id: '$$profile.user_id',
                first_name: '$$profile.first_name',
                last_name: '$$profile.last_name',
                department: '$$profile.department',
                job_title: '$$profile.job_title',
                employeeId: '$$profile.employeeId',
                isActive: '$$profile.isActive'
              }
            }
          },
          employee_assignments_status: {
            $map: {
              input: '$employee_assignments',
              as: 'assignment',
              in: {
                _id: '$$assignment._id',
                employee_id: '$$assignment.employee_id',
                status: '$$assignment.status',
                assigned_at: '$$assignment.assigned_at',
                progress_percentage: '$$assignment.progress_percentage'
              }
            }
          }
        }
      },
      { $sort: { created_at: -1 } }
    ]);

    // Flatten assignment_id (string) while preserving full populated doc under assignment
    const data = instances.map((i: any) => {
      const assignmentDoc = i.assignment_id_populated || null;
      return {
        ...i,
        assignment_id: assignmentDoc || { _id: i.assignment_id?.toString?.() || i.assignment_id, title: 'Unknown Assignment' },
        assigned_by_user_id: i.assigned_by_user ? { email: i.assigned_by_user.email } : i.assigned_by_user_id
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching assignment instances:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assignment instances' },
      { status: 500 }
    );
  }
}

// POST /api/assignments/instances - Create assignment instance (individual or bulk)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      assignment_id, 
      account_id, 
      assigned_by_user_id, 
      deadline, 
      assignment_scope, 
      instructions,
      links, // <- accept links from client
      employee_ids, // For individual assignments
      filters // For bulk assignments
    } = body;

    // Basic payload echo for diagnostics (omit if sensitive)
    console.log('Create AssignmentInstance payload:', {
      assignment_id, account_id, assigned_by_user_id, assignment_scope,
      employee_idsCount: Array.isArray(employee_ids) ? employee_ids.length : undefined,
      hasFilters: !!filters,
      linksCount: Array.isArray(links) ? links.length : undefined
    });

    // Validate links if provided: must be array of http(s) URLs, trimmed, deduped, max 20
    let cleanedLinks: string[] | undefined = undefined;
    if (typeof links !== 'undefined') {
      if (!Array.isArray(links)) {
        return NextResponse.json({ success: false, error: 'links must be an array of URLs' }, { status: 400 });
      }

      // Normalize, trim, filter, validate http(s)
      const normalized = links
        .map((l: any) => (typeof l === 'string' ? l.trim() : ''))
        .filter((l: string) => l.length > 0)
        .filter((l: string) => /^https?:\/\//i.test(l))
        .map((l: string) => l);

      // Deduplicate while preserving order
      const seen = new Set<string>();
      const deduped: string[] = [];
      for (const l of normalized) {
        if (!seen.has(l)) {
          seen.add(l);
          deduped.push(l);
        }
      }

      if (deduped.length > 20) {
        return NextResponse.json({ success: false, error: 'Too many links provided (max 20).' }, { status: 400 });
      }

      // Ensure length limits
      const tooLong = deduped.find(l => l.length > 2048);
      if (tooLong) {
        return NextResponse.json({ success: false, error: 'One or more links exceed maximum length (2048 characters).' }, { status: 400 });
      }

      cleanedLinks = deduped;
    }

    // Validate required fields with detailed diagnostics
    const missing: string[] = [];
    if (!assignment_id) missing.push('assignment_id');
    if (!account_id) missing.push('account_id');
    if (!assigned_by_user_id) missing.push('assigned_by_user_id');
    if (!assignment_scope) missing.push('assignment_scope');
    if (missing.length) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields', missing },
        { status: 400 }
      );
    }

    if (!['INDIVIDUAL', 'BULK'].includes(assignment_scope)) {
      return NextResponse.json(
        { success: false, error: 'Invalid assignment_scope value', allowed: ['INDIVIDUAL', 'BULK'], received: assignment_scope },
        { status: 400 }
      );
    }
    
    // Verify admin privileges: MUST be a User with CORPORATE_ADMIN (optional temporary override via ?allowNonAdmin=true for diagnostics)
    const url = new URL(request.url);
    const allowNonAdmin = url.searchParams.get('allowNonAdmin') === 'true';
    const adminUser = await User.findById(assigned_by_user_id).lean();
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Assigned_by_user_id does not reference an existing User', assigned_by_user_id },
        { status: 403 }
      );
    }

    if (adminUser.role !== 'CORPORATE_ADMIN' && !allowNonAdmin) {
      return NextResponse.json(
        { success: false, error: 'Only corporate admins can create assignments', userRole: adminUser.role, hint: 'Login as / use id of a CORPORATE_ADMIN or append allowNonAdmin=true for temporary bypass (not for production).'},
        { status: 403 }
      );
    }

    // Verify the assignment exists & active
    const assignment = await AssignmentMaster.findById(assignment_id).lean();
    if (!assignment) {
      return NextResponse.json(
        { success: false, error: 'Assignment master not found', assignment_id },
        { status: 400 }
      );
    }
    if (assignment.is_active === false) {
      return NextResponse.json(
        { success: false, error: 'Assignment master is inactive', assignment_id },
        { status: 400 }
      );
    }

    let targetEmployees: any[] = [];
    let filterGuidance: any = null; // Track filter guidance to include in response

    if (assignment_scope === 'INDIVIDUAL') {
      if (!employee_ids || !Array.isArray(employee_ids) || employee_ids.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Employee IDs are required for individual assignments', received: employee_ids },
          { status: 400 }
        );
      }

      // Dedupe & validate ObjectId format
      const uniqueIds = Array.from(new Set<string>(employee_ids as string[]));
      const invalidFormat: string[] = [];
      const objectIds: mongoose.Types.ObjectId[] = [];
      uniqueIds.forEach(id => {
        if (typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)) {
          objectIds.push(new mongoose.Types.ObjectId(id));
        } else {
          invalidFormat.push(String(id));
        }
      });

      if (invalidFormat.length) {
        return NextResponse.json(
          { success: false, error: 'Some employee_ids have invalid ObjectId format', invalidFormat },
          { status: 400 }
        );
      }

      const employeesFound = await EmployeeProfile.find({
        _id: { $in: objectIds },
        isActive: true
      }).lean();

      const foundIdStrings = new Set(employeesFound.map(e => e._id.toString()));
      const notFound = uniqueIds.filter(id => !foundIdStrings.has(id));

      console.log('Individual assignment debug:', {
        requested: uniqueIds.length,
        found: employeesFound.length,
        notFoundCount: notFound.length,
        sample: employeesFound[0] ? employeesFound[0]._id.toString() : null
      });

      if (notFound.length) {
        return NextResponse.json(
          { success: false, error: 'Some employee_ids were not found or inactive', notFound, found: employeesFound.length },
          { status: 400 }
        );
      }

      targetEmployees = employeesFound;
    } else if (assignment_scope === 'BULK') {
      if (!filters || typeof filters !== 'object') {
        return NextResponse.json(
          { success: false, error: 'Filters object required for bulk assignments' },
          { status: 400 }
        );
      }

      // Extract optional control flags
      const allowAll = !!(filters as any).allowAll; // assign to every active employee
      const bypassAccountFilter = !!(filters as any).bypassAccountFilter; // diagnostic / temporary
      const diagnose = !!(filters as any).diagnose; // verbose diagnostics
      const returnDistincts = diagnose || !!(filters as any).returnDistincts;

      // Normalize filter fields (ignore empty strings)
      const dept = typeof filters.department === 'string' && filters.department.trim() ? filters.department.trim() : undefined;
      const jobTitle = typeof filters.job_title === 'string' && filters.job_title.trim() ? filters.job_title.trim() : undefined;
      const customAttrFilters = filters.customAttributes && typeof filters.customAttributes === 'object' ? filters.customAttributes : {};

      const hasEffectiveFieldFilters = !!(dept || jobTitle || (customAttrFilters && Object.keys(customAttrFilters).length > 0));

      if (!hasEffectiveFieldFilters && !allowAll) {
        // Set guidance but don't return early - we'll still create the instance
        let noFilterDistincts: any = undefined;
        try {
          noFilterDistincts = await EmployeeProfile.aggregate([
            { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' },
            { $match: { 'user.account_id': new mongoose.Types.ObjectId(account_id), isActive: true } },
            { $group: { _id: null, departments: { $addToSet: '$department' }, job_titles: { $addToSet: '$job_title' } } }
          ]);
        } catch (e) {
          console.warn('Failed to fetch distincts for departments/job_titles', e);
        }

        filterGuidance = {
          error: 'No effective filters provided (department / job_title / customAttributes). Provide at least one or set allowAll:true.',
          receivedKeys: Object.keys(filters),
          distincts: noFilterDistincts,
          needsFilter: true,
          hint: 'Use the distincts to populate department/job_title dropdowns or set filters.allowAll = true to assign to all employees.'
        };
        
        // Set targetEmployees to empty array and continue (will create instance with 0 employees)
        targetEmployees = [];
      }

      if (allowAll) {
        // Simple query for all active employees (optionally still restrict by account unless bypass requested)
        const baseMatch: any = { isActive: true };
        if (!bypassAccountFilter) {
          // Need to join users to enforce account scoping; otherwise just fetch all
          const pipelineAll: any[] = [
            { $match: baseMatch },
            { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'user' } },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }
          ];
          if (account_id) {
            pipelineAll.push({ $match: { 'user.account_id': new mongoose.Types.ObjectId(account_id) } });
          }
          targetEmployees = await EmployeeProfile.aggregate(pipelineAll);
        } else {
          targetEmployees = await EmployeeProfile.find(baseMatch).lean();
        }
      } else if (!filterGuidance) {
        // Only run pipeline if we haven't already set filterGuidance above
        // Build aggregation pipeline for bulk assignment with account filtering
        const pipeline: any[] = [
          { $match: { isActive: true } },
          { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'user' } },
          { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } }
        ];

        if (!bypassAccountFilter) {
          pipeline.push({ $match: { 'user.account_id': new mongoose.Types.ObjectId(account_id) } });
        }

        const additionalMatch: any = {};
        // Case-insensitive exact match using regex anchors
        const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (dept) additionalMatch.department = new RegExp('^' + escapeRegExp(dept) + '$', 'i');
        if (jobTitle) additionalMatch.job_title = new RegExp('^' + escapeRegExp(jobTitle) + '$', 'i');
        if (Object.keys(additionalMatch).length) pipeline.push({ $match: additionalMatch });

        // Custom attributes
        if (customAttrFilters && Object.keys(customAttrFilters).length > 0) {
          const attributeQuery: any[] = [];
          for (const [key, value] of Object.entries(customAttrFilters)) {
            const attrDef = await CustomAttributeDefinition.findOne({ account_id: account_id, name: key });
            if (attrDef) {
              attributeQuery.push({ attribute_id: attrDef._id, value });
            }
          }
          if (attributeQuery.length > 0) {
            const matchingEmployees = await EmployeeAttributeValue.find({ $and: attributeQuery }).distinct('employee_id');
            if (matchingEmployees.length > 0) {
              pipeline.push({ $match: { _id: { $in: matchingEmployees } } });
            } else {
              // Set guidance but continue to create instance with 0 employees
              let attrDistincts: any = undefined;
              if (returnDistincts) {
                attrDistincts = await EmployeeProfile.aggregate([
                  { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'user' } },
                  { $unwind: '$user' },
                  { $match: { 'user.account_id': new mongoose.Types.ObjectId(account_id), isActive: true } },
                  { $group: { _id: null, departments: { $addToSet: '$department' }, job_titles: { $addToSet: '$job_title' } } }
                ]);
              }
              filterGuidance = {
                error: 'No employees matched custom attribute filters',
                customAttrFilters,
                diagnostics: { attributeQuery, attrDefs: attributeQuery.length, dept, jobTitle },
                distincts: attrDistincts,
                needsFilter: true,
                hint: 'No employees matched the provided custom attribute filters. Use the returned distincts to choose department/job_title or set filters.allowAll = true to target all active employees.'
              };
              targetEmployees = [];
            }
          }
        }

        if (diagnose) {
          // Incremental stage counts
            const stageCounts: any[] = [];
            for (let i = 1; i <= pipeline.length; i++) {
              const partial = await EmployeeProfile.aggregate(pipeline.slice(0, i));
              stageCounts.push({ stage: i, op: Object.keys(pipeline[i-1])[0], count: partial.length });
            }
            console.log('Bulk assignment diagnostic pipeline:', JSON.stringify(pipeline, null, 2));
            console.log('Stage counts:', stageCounts);
        }

        targetEmployees = await EmployeeProfile.aggregate(pipeline);

        if (targetEmployees.length === 0) {
          let distincts: any = undefined;
          if (returnDistincts) {
            distincts = await EmployeeProfile.aggregate([
              { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'user' } },
              { $unwind: '$user' },
              { $match: { 'user.account_id': new mongoose.Types.ObjectId(account_id), isActive: true } },
              { $group: { _id: null, departments: { $addToSet: '$department' }, job_titles: { $addToSet: '$job_title' } } }
            ]);
          }
          // Set guidance but continue to create instance
          let pipelineDistincts: any = undefined;
          if (returnDistincts) {
            pipelineDistincts = await EmployeeProfile.aggregate([
              { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'user' } },
              { $unwind: '$user' },
              { $match: { 'user.account_id': new mongoose.Types.ObjectId(account_id), isActive: true } },
              { $group: { _id: null, departments: { $addToSet: '$department' }, job_titles: { $addToSet: '$job_title' } } }
            ]);
          }
          filterGuidance = {
            error: 'No employees found matching the criteria',
            diagnostics: { allowAll, bypassAccountFilter, dept, jobTitle, customAttrCount: Object.keys(customAttrFilters).length, regexUsed: true, pipelineLength: pipeline.length },
            distincts: pipelineDistincts,
            needsFilter: true,
            hint: 'No active employees matched the filters. Use distincts to pick department/job_title, relax filters, or resubmit with filters.allowAll = true to target all active employees.'
          };
        }
      }
    }

    // Always create & save instance (even for BULK with 0 employees)
    const instanceData: any = {
      assignment_id,
      account_id,
      assigned_by_user_id,
      deadline: deadline ? new Date(deadline) : undefined,
      assignment_scope,
      instructions,
      links: cleanedLinks // persist validated links (may be undefined)
    };

    // For INDIVIDUAL assignments with a single employee, set the direct assignment fields
    if (assignment_scope === 'INDIVIDUAL' && targetEmployees.length === 1) {
      instanceData.assigned_to_employee_id = targetEmployees[0]._id;
      instanceData.assigned_to_employee_name = `${targetEmployees[0].first_name} ${targetEmployees[0].last_name}`;
    }

    const instance = new AssignmentInstance(instanceData);
    await instance.save();

    // Create employee assignments if we have target employees
    if (targetEmployees.length > 0) {
      const assignmentEmployees = targetEmployees.map((employee: any) => ({
        instance_id: instance._id,
        employee_id: employee._id
      }));

      const AssignmentEmployee = (await import('@/lib/models')).AssignmentEmployee;
      await AssignmentEmployee.insertMany(assignmentEmployees);
    }

    // Populate assignment & user for response so frontend receives assignment_id data
    const populatedInstance = await AssignmentInstance.findById(instance._id)
      .populate('assignment_id', 'title description assignment_type difficulty_level')
      .populate('assigned_by_user_id', 'email')
      .lean();

    const assignmentDoc: any = populatedInstance?.assignment_id && typeof populatedInstance.assignment_id === 'object'
      ? populatedInstance.assignment_id
      : null;

    const flattenedInstance = populatedInstance ? {
      ...populatedInstance,
      assignment: assignmentDoc || undefined,
      assignment_id: assignmentDoc?._id ? assignmentDoc._id.toString() : (populatedInstance.assignment_id?.toString?.() || populatedInstance.assignment_id)
    } : populatedInstance;

    // Build response data
    const responseData = {
      instance: flattenedInstance,
      assignedEmployees: targetEmployees.length,
      assignment_id: flattenedInstance?.assignment_id
    };

    // If we have filter guidance, include it but still return success since instance was created
    if (filterGuidance) {
      return NextResponse.json({ 
        success: true, 
        data: responseData,
        ...filterGuidance // Include guidance fields for UI to handle
      }, { status: 201 });
    }

    return NextResponse.json({ 
      success: true, 
      data: responseData
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating assignment instance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create assignment instance', details: error?.message },
      { status: 500 }
    );
  }
}
