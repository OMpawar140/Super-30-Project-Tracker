/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
import React, { useState, useEffect } from 'react';
import { User, Mail, Award, Plus, X, Edit3,Calendar, CheckCircle, Loader, Star, TrendingUp, Activity } from 'lucide-react';
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
    "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg",
    "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg",
    "bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-lg",
    "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg",
    "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg",
    "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg",
    "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg",
    "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }


  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-300 text-lg">{error || 'Failed to load profile'}</p>
          <button 
            onClick={loadProfile}
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 dark:from-blue-600 dark:via-indigo-600 dark:to-violet-600 relative w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-transparent to-violet-50/20 dark:from-slate-900/20 dark:via-transparent dark:to-slate-900/20"></div>
            
            {/* Avatar positioned on the left */}
            <div className="absolute bottom-6 left-8">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full border-4 border-white dark:border-slate-800 shadow-2xl flex items-center justify-center">
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
            </div>
            
            {/* Profile Info positioned to the right of avatar */}
            <div className="absolute bottom-6 left-48 right-8 text-slate-900 dark:text-white">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold">
                  {currentUser?.displayName || profile.email.split('@')[0]}
                </h1>
                <span className="text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30 text-black">
                  <CheckCircle size={14} className="inline mr-1" />
                  Verified
                </span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Mail size={18} />
                <span className="text-lg">{profile.email}</span>
                <CheckCircle className="text-emerald-500" size={16} />
              </div>

              <div className="flex items-center gap-4 text-sm">
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
            
            <div className="absolute top-6 right-6">
              {saving && (
                <div className="flex items-center gap-2 text-white text-sm bg-black/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Loader className="animate-spin" size={16} />
                  <span>Saving...</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Profile Content */}
          <div className="relative px-8 pb-8">
            {/* Empty space since avatar is now in the cover */}
            <div className="h-16"></div>
          </div>
        </div>


        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Skills Section */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Award className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Skills & Technologies</h3>
                </div>
                <button
                  onClick={() => setIsEditingSkills(!isEditingSkills)}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 font-medium"
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
                        key={`${skill}-${index}`}
                        className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transform hover:scale-105 transition-all duration-200 ${skillColors[index % skillColors.length]}`}
                      >
                        {skill}
                        {isEditingSkills && (
                          <X 
                            size={14} 
                            className="cursor-pointer hover:bg-white/20 rounded-full p-0.5 transition-all duration-200"
                            onClick={() => removeSkill(skill)}
                          />
                        )}
                      </div>
                    );
                  })}
                  {getSkillset().length === 0 && (
                    <div className="text-center w-full py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
                        <Award className="text-slate-400 dark:text-slate-500" size={24} />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mb-2">No skills added yet</p>
                      <p className="text-slate-400 dark:text-slate-500 text-sm">Add your first skill below to showcase your expertise!</p>
                    </div>
                  )}
                </div>
                
                {/* Add New Skill */}
                {isEditingSkills && (
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-600">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Add new skill (e.g., React, Python, AWS)..."
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        disabled={saving}
                      />
                      <button
                        onClick={addSkill}
                        disabled={saving || !newSkill.trim()}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                      Add skills that represent your expertise and interests. This helps others understand your capabilities.
                    </p>
                  </div>
                )}
              </div>
            </div>


            {/* Activity Section */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Account Status</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                  <CheckCircle className="text-emerald-500" size={18} />
                  <span className="text-slate-700 dark:text-slate-200 font-medium">Email verified</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                  <CheckCircle className="text-emerald-500" size={18} />
                  <span className="text-slate-700 dark:text-slate-200 font-medium">Google connected</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                  <CheckCircle className="text-emerald-500" size={18} />
                  <span className="text-slate-700 dark:text-slate-200 font-medium">Profile active</span>
                </div>
              </div>
            </div>
          </div>


          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Profile Completion */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
                  <TrendingUp className="text-violet-600 dark:text-violet-400" size={20} />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Profile Completion</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300">Progress</span>
                  <span className="font-bold text-lg text-violet-600 dark:text-violet-400">
                    {getProfileCompletionPercentage()}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-violet-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                    style={{ width: `${getProfileCompletionPercentage()}%` }}
                  ></div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-500" />
                    <span className="text-slate-600 dark:text-slate-300">Email verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSkillset().length > 0 ? (
                      <CheckCircle size={14} className="text-emerald-500" />
                    ) : (
                      <div className="w-3.5 h-3.5 border-2 border-slate-300 dark:border-slate-600 rounded-full"></div>
                    )}
                    <span className={`${getSkillset().length > 0 ? "text-slate-600 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"}`}>
                      Skills added ({getSkillset().length})
                    </span>
                  </div>
                </div>
              </div>
            </div>


            {/* Statistics */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Projects Created</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">{getProjectsCount()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Project Memberships</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{getMembershipsCount()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Skills</span>
                  <span className="font-bold text-violet-600 dark:text-violet-400 text-lg">{getSkillset().length}</span>
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
                