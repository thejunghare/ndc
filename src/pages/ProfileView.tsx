import { useState, useEffect } from "react";
import { Button, Label, TextInput, Card, Alert } from "flowbite-react";
import { useUser } from "../lib/UserContext";
import { supabase } from "../db/supabase";
import { HiInformationCircle } from "react-icons/hi";

interface ProfileData {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
}

const ProfileView = () => {
  const { current } = useUser();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!current) return;

      try {
        const { data, error } = await supabase
          .from("profile")
          .select("*")
          .eq("user_id", current.id)
          .single();

        if (error) throw error;

        if (data) {
          setProfile(data);
          setFormData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
          });
        }
      } catch (err) {
        setError("Failed to fetch profile data");
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [current]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!current) return;

    try {
      const { error } = await supabase
        .from("profile")
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", current.id);

      if (error) throw error;

      // Refresh profile data
      const { data } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", current.id)
        .single();

      if (data) {
        setProfile(data);
        setIsEditing(false);
      }
    } catch (err) {
      setError("Failed to update profile");
      console.error("Error updating profile:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="failure" icon={HiInformationCircle}>
        {error}
      </Alert>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Profile Information</h2>
          <Button
            color={isEditing ? "failure" : "info"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name" value="Full Name" />
            <TextInput
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="email" value="Email" />
            <TextInput
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="phone" value="Phone Number" />
            <TextInput
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="address" value="Address" />
            <TextInput
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div className="flex justify-end">
              <Button color="success" onClick={handleSubmit}>
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProfileView;