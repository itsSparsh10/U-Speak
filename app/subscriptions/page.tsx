'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CreditCard, 
  Check, 
  Building2, 
  MapPin, 
  FileText, 
  Hash,
  Calendar,
  DollarSign,
  Star,
  Zap,
  Crown,
  Shield
} from 'lucide-react';

const plans = [
  {
    name: 'Basic',
    price: '$29',
    period: 'per month',
    features: [
      'Up to 10 video analyses per month',
      'Basic reporting',
      'Email support',
      'Standard processing speed'
    ],
    current: false,
    icon: Shield,
    color: 'from-blue-400 to-blue-600',
    bgColor: 'from-blue-50 to-blue-100'
  },
  {
    name: 'Professional',
    price: '$79',
    period: 'per month',
    features: [
      'Up to 50 video analyses per month',
      'Advanced reporting & analytics',
      'Priority support',
      'Fast processing speed',
      'Custom branding',
      'API access'
    ],
    current: true,
    icon: Star,
    color: 'from-purple-400 to-purple-600',
    bgColor: 'from-purple-50 to-purple-100'
  },
  {
    name: 'Enterprise',
    price: '$199',
    period: 'per month',
    features: [
      'Unlimited video analyses',
      'Advanced analytics & insights',
      '24/7 dedicated support',
      'Fastest processing speed',
      'White-label solution',
      'Full API access',
      'Custom integrations',
      'On-premise deployment option'
    ],
    current: false,
    icon: Crown,
    color: 'from-orange-400 to-orange-600',
    bgColor: 'from-orange-50 to-orange-100'
  }
];




export default function SubscriptionsPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Main Content */}
            <div className="col-span-12">
              <div className="space-y-8">
                {/* Current Subscription Card */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-6">
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">Professional Subscription</h2>
                        <p className="text-blue-100">Renew Date: 28 March 2024</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm">Main License</span>
                          <Badge className="bg-white/20 text-white border-white/30">+8 Additional</Badge>
                        </div>
                        <div className="text-3xl font-bold">$79.00 + VAT</div>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Additional License Section */}
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                            <Building2 className="w-12 h-12 text-blue-600" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Additional License</h3>
                          <div className="text-4xl font-bold text-gray-900 mb-1">
                            $85<span className="text-lg text-gray-500">/mo</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 text-gray-700">
                            <Check className="w-5 h-5 text-green-500" />
                            <span className="text-sm">Unlimited accounts</span>
                          </div>
                          <div className="flex items-center space-x-3 text-gray-700">
                            <Check className="w-5 h-5 text-green-500" />
                            <span className="text-sm">No installation fee</span>
                          </div>
                          <div className="flex items-center space-x-3 text-gray-700">
                            <Check className="w-5 h-5 text-green-500" />
                            <span className="text-sm">No maintenance fee</span>
                          </div>
                          <div className="flex items-center space-x-3 text-gray-700">
                            <Check className="w-5 h-5 text-green-500" />
                            <span className="text-sm">No updates fees</span>
                          </div>
                        </div>

                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl shadow-lg">
                          Buy additional license
                        </Button>
                      </div>

                      {/* Payment Information */}
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                          <h4 className="font-semibold text-gray-900 mb-4">Last Payment</h4>
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-sm text-gray-600">Payment failed</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-sm">•••• •••• •••• 0009</span>
                                <Badge className="bg-blue-600 text-white text-xs">VISA</Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">+ $1100.39</div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6">
                          <h4 className="font-semibold text-gray-900 mb-4">Next Payment</h4>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">28 March 2024</p>
                            </div>
                            <div className="text-lg font-bold text-gray-900">$1341.00</div>
                          </div>
                        </div>

                        <div className="flex space-x-4">
                          <Button variant="outline" className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50">
                            Change Payment Method
                          </Button>
                          <Button variant="outline" className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50">
                            Payment History
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Available Plans */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-2xl font-bold text-gray-900">Available Plans</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {plans.map((plan, index) => {
                        const IconComponent = plan.icon;
                        return (
                          <Card 
                            key={index} 
                            className={`relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${
                              plan.current ? 'ring-2 ring-purple-500' : ''
                            }`}
                          >
                            <div className={`absolute inset-0 bg-gradient-to-br ${plan.bgColor} opacity-50`}></div>
                            
                            <CardContent className="relative z-10 p-8 text-center">
                              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star w-8 h-8 text-white" aria-hidden="true">
                                  <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                                </svg>
                              </div>
                              
                              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                              <div className="mb-6">
                                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                                <span className="text-gray-600 ml-2">{plan.period}</span>
                              </div>
                              
                              {plan.current && (
                                <div className="mb-8 flex justify-center">
                                  <Badge className="bg-purple-600 text-white px-4 py-1 shadow-lg text-base rounded-xl">
                                    Current Plan
                                  </Badge>
                                </div>
                              )}
                              
                              <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, featureIndex) => (
                                  <li key={featureIndex} className="flex items-start space-x-3">
                                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700 text-sm text-left">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                              
                              <Button 
                                className={`w-full py-3 rounded-xl shadow-lg transition-all duration-200 ${
                                  plan.current 
                                    ? 'bg-gray-100 text-gray-600 cursor-not-allowed hover:bg-gray-100' 
                                    : `bg-gradient-to-r ${plan.color} hover:shadow-xl text-white transform hover:scale-105`
                                }`}
                                disabled={plan.current}
                              >
                                {plan.current ? 'Current Plan' : 'Upgrade'}
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Billing Information */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
                  <CardHeader className="border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-bold text-gray-900">Billing</CardTitle>
                      <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                        Change Billing
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-gray-600 mb-2">
                          <Building2 className="w-4 h-4" />
                          <Label className="text-sm font-medium">Corporate Name</Label>
                        </div>
                        <p className="text-gray-900 font-medium">uSpeek.</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          <Label className="text-sm font-medium">Address</Label>
                        </div>
                        <p className="text-gray-900 font-medium">123 Business Street, New York, NY 10001</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-gray-600 mb-2">
                          <FileText className="w-4 h-4" />
                          <Label className="text-sm font-medium">Tax Department</Label>
                        </div>
                        <p className="text-gray-900 font-medium">Finance Dept</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-gray-600 mb-2">
                          <Hash className="w-4 h-4" />
                          <Label className="text-sm font-medium">Tax ID</Label>
                        </div>
                        <p className="text-gray-900 font-medium">123456789123</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Billing History */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-2xl font-bold text-gray-900">Billing History</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Professional Plan</div>
                            <div className="text-sm text-gray-600 flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>January 15, 2024</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-xl text-gray-900">$79.00</div>
                          <Badge className="bg-green-100 text-green-800 mt-1">Paid</Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Professional Plan</div>
                            <div className="text-sm text-gray-600 flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>December 15, 2023</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-xl text-gray-900">$79.00</div>
                          <Badge className="bg-green-100 text-green-800 mt-1">Paid</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}