import React, { useState } from 'react';
import { backendService } from '../lib/backend';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { useToast } from '../hooks/use-toast';

const EmailTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testName, setTestName] = useState('');
  const { toast } = useToast();

  const showResult = (success: boolean, message: string) => {
    toast({
      title: success ? 'Success!' : 'Error',
      description: message,
      variant: success ? 'default' : 'destructive',
    });
  };

  const testWelcomeEmail = async () => {
    if (!testEmail || !testName) {
      showResult(false, 'Please fill in email and name fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await backendService.sendEmail('welcome', {
        email: testEmail,
        name: testName
      });

      showResult(true, 'Welcome email sent successfully!');
      console.log('Welcome email response:', response);
    } catch (error: any) {
      showResult(false, `Failed to send welcome email: ${error.message}`);
      console.error('Welcome email error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testOrderInvoiceEmail = async () => {
    if (!testEmail || !testName) {
      showResult(false, 'Please fill in email and name fields');
      return;
    }

    setIsLoading(true);
    try {
      const orderDetails = {
        orderId: 'ORD-' + Date.now(),
        productName: 'Steam Wallet $50',
        amount: 50,
        currency: 'USD',
        orderDate: new Date().toLocaleDateString(),
        category: 'Gift Cards'
      };

      const response = await backendService.sendEmail('order-invoice', {
        email: testEmail,
        name: testName,
        orderDetails
      });

      showResult(true, 'Order invoice email sent successfully!');
      console.log('Order invoice response:', response);
    } catch (error: any) {
      showResult(false, `Failed to send order invoice: ${error.message}`);
      console.error('Order invoice error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testVerificationEmail = async () => {
    if (!testEmail || !testName) {
      showResult(false, 'Please fill in email and name fields');
      return;
    }

    setIsLoading(true);
    try {
      const verificationLink = `https://onedigitalspot.com/verify?token=${Date.now()}`;

      const response = await backendService.sendEmail('verification', {
        email: testEmail,
        name: testName,
        verificationLink
      });

      showResult(true, 'Verification email sent successfully!');
      console.log('Verification email response:', response);
    } catch (error: any) {
      showResult(false, `Failed to send verification email: ${error.message}`);
      console.error('Verification email error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testDeliveryEmail = async () => {
    if (!testEmail || !testName) {
      showResult(false, 'Please fill in email and name fields');
      return;
    }

    setIsLoading(true);
    try {
      const orderDetails = {
        orderId: 'ORD-' + Date.now(),
        productName: 'PUBG Mobile UC 1200',
        amount: 25,
        currency: 'USD',
        orderDate: new Date().toLocaleDateString(),
        category: 'Mobile Games'
      };

      const productData = {
        ucAmount: '1200 UC',
        gameId: 'Enter your PUBG Mobile ID',
        instructions: 'Log into your PUBG Mobile account and check your UC balance. If you don\'t see the UC immediately, please restart the game.',
        deliveryMethod: 'In-Game Purchase',
        estimatedDelivery: '5-15 minutes'
      };

      const response = await backendService.sendEmail('delivery', {
        email: testEmail,
        name: testName,
        orderDetails,
        productData
      });

      showResult(true, 'Delivery email sent successfully!');
      console.log('Delivery email response:', response);
    } catch (error: any) {
      showResult(false, `Failed to send delivery email: ${error.message}`);
      console.error('Delivery email error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Email Testing Dashboard</h1>
        <p className="text-gray-600">Test all email templates and functionality</p>
      </div>

      {/* Test Credentials */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Credentials</CardTitle>
          <CardDescription>Enter email and name for testing all email types</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Test Email</label>
            <Input
              type="email"
              placeholder="test@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Test Name</label>
            <Input
              type="text"
              placeholder="John Doe"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Tests */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Welcome Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              👋 Welcome Email
            </CardTitle>
            <CardDescription>
              Test the welcome email sent to new users after registration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testWelcomeEmail} 
              disabled={isLoading || !testEmail || !testName}
              className="w-full"
            >
              {isLoading ? 'Sending...' : 'Send Welcome Email'}
            </Button>
          </CardContent>
        </Card>

        {/* Order Invoice Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📄 Order Invoice
            </CardTitle>
            <CardDescription>
              Test order invoice email with sample Steam Wallet purchase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testOrderInvoiceEmail} 
              disabled={isLoading || !testEmail || !testName}
              className="w-full"
            >
              {isLoading ? 'Sending...' : 'Send Order Invoice'}
            </Button>
          </CardContent>
        </Card>

        {/* Verification Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔐 Email Verification
            </CardTitle>
            <CardDescription>
              Test email verification with sample verification link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testVerificationEmail} 
              disabled={isLoading || !testEmail || !testName}
              className="w-full"
            >
              {isLoading ? 'Sending...' : 'Send Verification Email'}
            </Button>
          </CardContent>
        </Card>

        {/* Delivery Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎉 Product Delivery
            </CardTitle>
            <CardDescription>
              Test delivery email with sample PUBG Mobile UC purchase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testDeliveryEmail} 
              disabled={isLoading || !testEmail || !testName}
              className="w-full"
            >
              {isLoading ? 'Sending...' : 'Send Delivery Email'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-600">
            <p><strong>⚠️ Important:</strong> Due to Resend free tier restrictions, emails can only be sent to verified email addresses.</p>
            <p><strong>📧 Email Types:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Welcome:</strong> Sent when users sign up for an account</li>
              <li><strong>Order Invoice:</strong> Sent after successful payment with order details</li>
              <li><strong>Verification:</strong> Sent to verify email addresses with confirmation link</li>
              <li><strong>Delivery:</strong> Sent when digital products are delivered with instructions</li>
            </ul>
            <p className="mt-3"><strong>🔧 Backend Server:</strong> Make sure the backend server is running on port 3001 before testing.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTest;
