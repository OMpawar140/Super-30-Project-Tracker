import React, { useState, useEffect } from 'react';
import { User, Mail, Award, Plus, X, Edit3, Save, Camera, Calendar, CheckCircle, Loader, Settings, Star, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';

interface UserProfile {
  id?: string;
  name?: string;
  email: string;
  skillset: string[];
  _count?: {
    createdProjects: number;
    projectMembers: number;
  };
}

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Editing states
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  
  const skillColors = [
    "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
    "bg-gradient-to-r from-green-500 to-green-600 text-white",
    "bg-gradient-to-r from-purple-500 to-purple-600 text-white",
    "bg-gradient-to-r from-orange-500 to-orange-600 text-white",
    "bg-gradient-to-r from-pink-500 to-pink-600 text-white",
    "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white",
    "bg-gradient-to-r from-teal-500 to-teal-600 text-white",
    "bg-gradient-to-r from-red-500 to-red-600 text-white"
  ];

  // Load user profile
  useEffect(() => {
    loadProfile();
  }, [currentUser?.email]);

  const loadProfile = async () => {
    if (!currentUser?.email) {
      setError('No user email found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiService.users.getUserByEmail(currentUser.email);
      
      console.log('Raw API response:', response);
      
      // Extract the actual user data from the response
      const userData = response.data || response;
      
      console.log('Extracted user data:', userData);
      
      // Ensure skillset is always an array
      const normalizedProfile = {
        ...userData,
        skillset: Array.isArray(userData.skillset) ? userData.skillset : [],
        _count: userData._count || { createdProjects: 0, projectMembers: 0 }
      };
      
      console.log('Normalized profile:', normalizedProfile);
      setProfile(normalizedProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
      // If user doesn't exist, create one
      if (currentUser?.email) {
        try {
          const newUserResponse = await apiService.users.createUser({
            email: currentUser.email,
            skillset: []
          });
          
          // Extract the actual user data from the response
          const newUserData = newUserResponse.data || newUserResponse;
          
          // Ensure skillset is always an array for new user too
          const normalizedNewUser = {
            ...newUserData,
            skillset: Array.isArray(newUserData.skillset) ? newUserData.skillset : [],
            _count: { createdProjects: 0, projectMembers: 0 }
          };
          
          setProfile(normalizedNewUser);
          toast.success('Profile created successfully!');
        } catch (createError) {
          console.error('Error creating user:', createError);
          setError('Failed to load or create profile');
          toast.error('Failed to load profile');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updateData: Partial<UserProfile>) => {
    if (!profile || !currentUser?.email) return false;
    
    try {
      setSaving(true);
      console.log('Updating profile with data:', updateData);
      console.log('Using user email:', currentUser.email);
      console.log('Current profile before update:', profile);
      
      // Use currentUser.email instead of profile.email to ensure we're using the authenticated user's email
      const response = await apiService.users.updateUser(currentUser.email, updateData);
      
      console.log('Raw API response:', response);
      
      // Extract the actual user data from the response
      const updatedProfileData = response.data || response;
      
      console.log('Extracted updated profile data:', updatedProfileData);
      
      // Ensure skillset is always an array and force update
      const normalizedProfile = {
        ...updatedProfileData,
        skillset: Array.isArray(updatedProfileData.skillset) ? updatedProfileData.skillset : [],
        _count: updatedProfileData._count || profile._count || { createdProjects: 0, projectMembers: 0 }
      };
      
      console.log('Normalized profile after update:', normalizedProfile);
      
      // Force state update with a new object reference
      setProfile(normalizedProfile);
      
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const addSkill = async () => {
    if (!profile || !newSkill.trim()) return;
    
    const skillToAdd = newSkill.trim();
    const currentSkills = profile.skillset || [];
    
    console.log('Adding skill:', skillToAdd);
    console.log('Current skills:', currentSkills);
    
    if (currentSkills.includes(skillToAdd)) {
      toast.error('Skill already exists');
      return;
    }

    const updatedSkillset = [...currentSkills, skillToAdd];
    console.log('Updated skillset to send:', updatedSkillset);
    
    const success = await updateProfile({ skillset: updatedSkillset });
    if (success) {
      setNewSkill('');
      console.log('Skill added successfully');
      // Force a re-render by updating a dummy state
      setTimeout(() => {
        console.log('Profile state after skill addition:', profile);
      }, 200);
    }
  };

  const removeSkill = async (skillToRemove: string) => {
    if (!profile) return;
    
    const currentSkills = profile.skillset || [];
    const updatedSkillset = currentSkills.filter(skill => skill !== skillToRemove);
    await updateProfile({ skillset: updatedSkillset });
  };

  const getProfileCompletionPercentage = () => {
    if (!profile) return 0;
    let completed = 1; // Email is always present
    let total = 2;
    
    const skillsCount = profile.skillset?.length || 0;
    if (skillsCount > 0) completed++;
    
    return Math.round((completed / total) * 100);
  };

  // Safe getters for profile data
  const getSkillset = () => profile?.skillset || [];
  const getProjectsCount = () => profile?._count?.createdProjects || 0;
  const getMembershipsCount = () => profile?._count?.projectMembers || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <p className="text-gray-500 text-lg">{error || 'Failed to load profile'}</p>
          <button 
            onClick={loadProfile}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-yellow-300 via-white-300 to-yellow-300 relative">
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="absolute top-6 right-6">
              {saving && (
                <div className="flex items-center gap-2 text-white text-sm bg-black bg-opacity-20 rounded-full px-4 py-2">
                  <Loader className="animate-spin" size={16} />
                  <span>Saving...</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Profile Content */}
          <div className="relative px-8 pb-8">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-20 mb-8">
              <div className="relative mb-6 sm:mb-0">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
                  {currentUser?.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={profile.name || 'User'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={48} className="text-white" />
                  )}
                </div>
                <button className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg transform hover:scale-105">
                  <Camera size={16} />
                </button>
              </div>
              
              <div className="sm:ml-8 flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {currentUser?.displayName || profile.email.split('@')[0]}
                  </h1>
                  <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    <CheckCircle size={14} className="inline mr-1" />
                    Verified
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="text-gray-400" size={18} />
                  <span className="text-gray-600 text-lg">{profile.email}</span>
                  <CheckCircle className="text-green-500" size={16} />
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Member since {new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={14} />
                    <span>{getSkillset().length} Skills</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-4 sm:mt-0">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Settings size={16} />
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Skills Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Award className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Skills & Technologies</h3>
                </div>
                <button
                  onClick={() => setIsEditingSkills(!isEditingSkills)}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit3 size={16} />
                  {isEditingSkills ? 'Done' : 'Edit'}
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Skills Display */}
                <div className="flex flex-wrap gap-3">
                  {getSkillset().map((skill, index) => {
                    console.log('Rendering skill:', skill, 'at index:', index);
                    return (
                      <div 
                        key={`${skill}-${index}`} // Use index to force re-render
                        className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm transform hover:scale-105 transition-all ${skillColors[index % skillColors.length]}`}
                      >
                        {skill}
                        {isEditingSkills && (
                          <X 
                            size={14} 
                            className="cursor-pointer hover:bg-white hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
                            onClick={() => removeSkill(skill)}
                          />
                        )}
                      </div>
                    );
                  })}
                  {getSkillset().length === 0 && (
                    <p className="text-gray-400 italic text-center w-full py-8">
                      No skills added yet. Add your first skill below to showcase your expertise!
                    </p>
                  )}
                </div>
                
                {/* Add New Skill */}
                {isEditingSkills && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Add new skill (e.g., React, Python, AWS)..."
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        disabled={saving}
                      />
                      <button
                        onClick={addSkill}
                        disabled={saving || !newSkill.trim()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Add skills that represent your expertise and interests. This helps others understand your capabilities.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="text-green-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Recent Activity</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-gray-700 font-medium">Profile created</p>
                    <p className="text-gray-500 text-sm">Welcome to the platform!</p>
                  </div>
                  <span className="text-gray-400 text-sm">Today</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-gray-700 font-medium">Connected Google account</p>
                    <p className="text-gray-500 text-sm">Secure authentication enabled</p>
                  </div>
                  <span className="text-gray-400 text-sm">Today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Profile Completion */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="text-purple-600" size={20} />
                </div>
                <h3 className="font-semibold text-gray-800">Profile Completion</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-bold text-lg text-purple-600">
                    {getProfileCompletionPercentage()}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${getProfileCompletionPercentage()}%` }}
                  ></div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" />
                    <span className="text-gray-600">Email verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSkillset().length > 0 ? (
                      <CheckCircle size={14} className="text-green-500" />
                    ) : (
                      <div className="w-3.5 h-3.5 border-2 border-gray-300 rounded-full"></div>
                    )}
                    <span className={getSkillset().length > 0 ? "text-gray-600" : "text-gray-400"}>
                      Skills added ({getSkillset().length})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Projects Created</span>
                  <span className="font-bold text-blue-600">{getProjectsCount()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Project Memberships</span>
                  <span className="font-bold text-green-600">{getMembershipsCount()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Skills</span>
                  <span className="font-bold text-purple-600">{getSkillset().length}</span>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-blue-100">
              <h3 className="font-semibold text-gray-800 mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-500" size={18} />
                  <span className="text-gray-700">Email verified</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-500" size={18} />
                  <span className="text-gray-700">Google connected</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-500" size={18} />
                  <span className="text-gray-700">Profile active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;