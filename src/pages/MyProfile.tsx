import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { getCurrentUser } from "../lib/orders";
import { account } from "../lib/appwrite";
import { useToast } from "../hooks/use-toast";

const MyProfile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const u = await getCurrentUser();
        setUser(u);
        setName(u.name || "");
        setEmail(u.email || "");
        setPhone((u?.prefs && u.prefs.phone) || u.phone || "");
      } catch (err: any) {
        console.error("Failed to load user:", err);
        if (err?.message?.toLowerCase().includes("unauthorized") || err?.message?.includes("401")) {
          navigate("/auth/login?redirect=" + encodeURIComponent("/my-profile"));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      // Update name
      if (name !== (user?.name || "")) {
        await (account as any).updateName(name);
      }

      // Update email (may require re-auth)
      if (email !== (user?.email || "")) {
        try {
          await (account as any).updateEmail(email);
        } catch (err: any) {
          console.warn("Email update failed", err);
          toast({ title: "Email update requires re-authentication or verification." });
        }
      }

      // Save phone to prefs if supported
      try {
        const prefs = { ...(user?.prefs || {}), phone };
        await (account as any).updatePrefs(prefs);
      } catch (err) {
        console.warn("Could not save prefs", err);
      }

      toast({ title: "Profile saved" });
      const refreshed = await getCurrentUser();
      setUser(refreshed);
      setName(refreshed.name || "");
      setEmail(refreshed.email || "");
      setPhone((refreshed?.prefs && refreshed.prefs.phone) || refreshed.phone || "");
    } catch (err: any) {
      console.error("Save failed", err);
      toast({ title: "Save failed", description: err?.message || "Could not update profile" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast({ title: "Please fill both current and new password" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match" });
      return;
    }
    setChangingPwd(true);
    try {
      await (account as any).updatePassword(currentPassword, newPassword);
      toast({ title: "Password changed" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Password change failed", err);
      toast({ title: "Password change failed", description: err?.message || "Could not change password" });
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 font-pixel">My Profile</h1>

          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">Profile</h2>
            <p className="text-sm text-gray-500 mb-4">Update your name, contact and profile details.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Full name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>

              <div className="flex items-end">
                <div className="ml-auto">
                  <Button onClick={handleSaveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-2">Security</h2>
            <p className="text-sm text-gray-500 mb-4">Change your account password.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Current password</label>
                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">New password</label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">Confirm new password</label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>

              <div className="flex items-end">
                <div className="ml-auto">
                  <Button variant="default" onClick={handleChangePassword} disabled={changingPwd}>{changingPwd ? 'Changing...' : 'Change password'}</Button>
                </div>
              </div>
            </div>
          </Card>

        </div>
      </main>
    </div>
  );
};

export default MyProfile;
