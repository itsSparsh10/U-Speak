"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Layers, User as UserIcon } from "lucide-react";
import { WorkReportDialog } from "@/components/assignments/work-report-dialog";
import Link from "next/link";

interface AssignmentMaster {
  _id: string;
  title: string;
  description?: string;
  assignment_type?: string;
  difficulty_level?: string;
}

interface AssignmentInstance {
  _id: string;
  assignment_id: AssignmentMaster;
  deadline?: string;
  assignment_scope: "INDIVIDUAL" | "BULK";
  status: string;
  instructions?: string;
  links?: string[];
}

interface EmployeeProfileRef {
  _id: string;
  first_name: string;
  last_name: string;
  department?: string;
  job_title?: string;
}

interface AssignmentEmployeeItem {
  _id: string;
  status: string;
  progress_percentage?: number;
  assigned_at?: string;
  instance_id: AssignmentInstance;
  employee_id?: EmployeeProfileRef;
}

export default function EmployeeAssignmentsPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const { toast } = useToast();

  const [dataLoading, setDataLoading] = useState(true);
  const [employeeProfileId, setEmployeeProfileId] = useState<string | null>(null);
  const [items, setItems] = useState<AssignmentEmployeeItem[]>([]);
  const [showWorkReportDialog, setShowWorkReportDialog] = useState(false);
  const [selectedAssignmentEmployee, setSelectedAssignmentEmployee] = useState<AssignmentEmployeeItem | null>(null);

  // Function to refresh assignments data
  const refreshAssignments = async () => {
    if (!employeeProfileId || !user?.id) return;
    
    try {
      console.log('🔄 Refreshing assignments data...');
      const response = await fetch(`/api/assignments/employees?employeeId=${employeeProfileId}`);
      if (!response.ok) throw new Error('Failed to refresh assignments');
      const result = await response.json();

      if (result.success) {
        console.log(`✅ Refreshed ${(result.data || []).length} assignments`);
        setItems(result.data || []);
      } else {
        console.error('Failed to refresh assignments:', result.error);
      }
    } catch (error) {
      console.error('Error refreshing assignments:', error);
    }
  };

  const isAdmin = useMemo(() => {
    return user?.role === "ADMIN" || user?.role === "CORPORATE_ADMIN";
  }, [user?.role]);

  // Helpers to extract a clean accountId similar to admin page
  function cleanObjectId(id: any): string | null {
    if (!id) return null;
    if (typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id)) return id;
    if (typeof id === 'object' && id._id) {
      const s = String(id._id);
      return /^[a-f0-9]{24}$/i.test(s) ? s : null;
    }
    if (typeof id === 'string') {
      const match = id.match(/[a-f0-9]{24}/i);
      if (match) return match[0];
    }
    return null;
  }

  function decodeJWT(t: string) {
    try {
      const base64Url = t.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  const accountId = useMemo(() => {
    // prefer from user object
    const fromUser = cleanObjectId(user?.corporateAccountId);
    if (fromUser) return fromUser;
    // fallback to token decode
    if (token) {
      const decoded = decodeJWT(token);
      const fromToken = cleanObjectId(decoded?.corporateAccountId);
      if (fromToken) return fromToken;
    }
    return null;
  }, [user?.corporateAccountId, token]);

  useEffect(() => {
    if (!isAuthenticated || isLoading || !user?.id) return;

    const load = async () => {
      try {
        setDataLoading(true);
        console.log(`Loading assignments for user: ${user.id}`);
        
        // 1) Find EmployeeProfile by current userId
        const employeeRes = await fetch(
          `/api/employees?method=by-user-id&targetId=${user.id}`
        );
        if (!employeeRes.ok) throw new Error("Failed to load employee profile");
        const employeeJson = await employeeRes.json();
        const profile = Array.isArray(employeeJson.data) ? employeeJson.data[0] : null;
        if (!profile?.id) {
          toast({
            title: "Profile missing",
            description: "No employee profile is linked to your user.",
            variant: "destructive",
          });
          setDataLoading(false);
          return;
        }
        setEmployeeProfileId(profile.id);
        console.log(`Found employee profile: ${profile.id}`);

        // 2) Load assignments for this employee
        const aeRes = await fetch(`/api/assignments/employees?employeeId=${profile.id}`);
        if (!aeRes.ok) throw new Error("Failed to load assignments");
        const aeJson = await aeRes.json();
        setItems(aeJson.data || []);
        console.log(`Loaded ${(aeJson.data || []).length} assignments`);
      } catch (e: any) {
        console.error('Error loading employee assignments:', e);
        toast({ title: "Error", description: e.message || "Something went wrong", variant: "destructive" });
      } finally {
        setDataLoading(false);
      }
    };

    load();
  }, [isAuthenticated, isLoading, user?.id, toast]);

  const statusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "OVERDUE":
        return "bg-red-100 text-red-800";
      case "ASSIGNED":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-4">Please log in to view your assignments.</p>
            <Button onClick={() => (window.location.href = "/auth")}>Go to Login</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isAdmin) {
    // Guard: this page is for employee view
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-xl font-semibold mb-2">Employee Assignments</h1>
            <p className="text-gray-600">This page is intended for employee users. Use the Assignments page for admin.</p>
            <Button className="mt-4" onClick={() => (window.location.href = "/assignments")}>Go to Admin Assignments</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (dataLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Assignments</h1>
            <p className="text-gray-600">All tasks assigned to you with deadlines</p>
          </div>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No assignments found.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const inst = item.instance_id;
              const master = inst?.assignment_id as AssignmentMaster | undefined;
              const progress = item.progress_percentage ?? 0;
              const deadline = inst?.deadline ? new Date(inst.deadline).toLocaleString() : null;

              return (
                <Card key={item._id} className="shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="truncate" title={master?.title || "Assignment"}>
                        {master?.title || "Assignment"}
                      </span>
                      <Badge className={statusColor(item.status)}>{item.status}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-gray-600 line-clamp-3">
                      {master?.description || inst?.instructions || "No description provided."}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{master?.assignment_type || "TASK"}</span>
                      </div>
                      {deadline && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Due: {deadline}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {inst?.instructions && (
                      <div className="text-xs text-gray-500">
                        <span className="font-medium text-gray-700">Instructions: </span>
                        {inst.instructions}
                      </div>
                    )}

                    {inst?.links && inst.links.length > 0 && (
                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="font-medium text-gray-700">Links:</div>
                        <ul className="list-disc pl-5 space-y-1">
                          {inst.links.map((link, idx) => (
                            <li key={idx} className="truncate">
                              <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {link}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between">
                      <Button
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          setSelectedAssignmentEmployee(item);
                          setShowWorkReportDialog(true);
                        }}
                      >
                        View Details
                      </Button>
                      {item.assigned_at && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Assigned {new Date(item.assigned_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {selectedAssignmentEmployee && selectedAssignmentEmployee.employee_id && (
        <WorkReportDialog
          isOpen={showWorkReportDialog}
          onOpenChange={setShowWorkReportDialog}
          assignmentEmployee={{
            _id: selectedAssignmentEmployee._id,
            instance_id: {
              _id: selectedAssignmentEmployee.instance_id._id,
              assignment_id: {
                title: selectedAssignmentEmployee.instance_id.assignment_id.title || 'Assignment',
                assignment_type: selectedAssignmentEmployee.instance_id.assignment_id.assignment_type || 'TASK'
              },
              status: selectedAssignmentEmployee.instance_id.status,
              deadline: selectedAssignmentEmployee.instance_id.deadline
            },
            employee_id: {
              first_name: selectedAssignmentEmployee.employee_id.first_name,
              last_name: selectedAssignmentEmployee.employee_id.last_name,
              department: selectedAssignmentEmployee.employee_id.department || '',
              job_title: selectedAssignmentEmployee.employee_id.job_title || ''
            },
            status: selectedAssignmentEmployee.status,
            progress_percentage: selectedAssignmentEmployee.progress_percentage || 0
          }}
          accountId={accountId || ''}
          employeeId={employeeProfileId || undefined}
          onSuccess={refreshAssignments}
        />
      )}
    </DashboardLayout>
  );
}
