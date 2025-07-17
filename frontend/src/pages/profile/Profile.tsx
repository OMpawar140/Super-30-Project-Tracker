import React, { useState } from 'react';
import { User, Mail, Award, Plus, X, Edit3, Save, Camera } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Profile {
  name: string;
  email: string | null | undefined;
  avatar: string;
}

interface ProfileComponentProps {
  currentUser?: {
    displayName?: string;
    email?: string;
    photoURL?: string;
  };
  onUpdateProfile?: (profile: Partial<Profile>) => void;
}

const Profile: React.FC<ProfileComponentProps> = () => {

  const { currentUser } = useAuth();
  // Mock data - in real app this would come from Firebase/props
  const [profile] = useState<Profile>({
    name: currentUser?.displayName || "User",
    email: currentUser?.email,
    avatar: currentUser?.photoURL ?? "",
    // skills: ["React", "JavaScript", "Node.js", "Python", "AWS", "MongoDB"],
  });

  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [isEditingLocation, setIsEditingLocation] = useState<boolean>(false);
  const [newSkill, setNewSkill] = useState<string>("");
  // const [tempTitle, setTempTitle] = useState<string>(profile.title);
  // const [tempBio, setTempBio] = useState<string>(profile.bio);
  // const [tempLocation, setTempLocation] = useState<string>(profile.location);

  // const skillColors: string[] = [
  //   "bg-blue-100 text-blue-800",
  //   "bg-green-100 text-green-800", 
  //   "bg-purple-100 text-purple-800",
  //   "bg-orange-100 text-orange-800",
  //   "bg-pink-100 text-pink-800",
  //   "bg-indigo-100 text-indigo-800"
  // ];

  // const addSkill = (): void => {
  //   if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
  //     const updatedProfile = {
  //       ...profile,
  //       skills: [...profile.skills, newSkill.trim()]
  //     };
  //     setProfile(updatedProfile);
  //     setNewSkill("");
  //   }
  // };

  // const removeSkill = (skillToRemove: string): void => {
  //   const updatedProfile = {
  //     ...profile,
  //     skills: profile.skills.filter(skill => skill !== skillToRemove)
  //   };
  //   setProfile(updatedProfile);
  // };

  // const saveTitle = (): void => {
  //   const updatedProfile = { ...profile, title: tempTitle };
  //   setProfile(updatedProfile);
  //   setIsEditingTitle(false);
  // };

  // const saveBio = (): void => {
  //   const updatedProfile = { ...profile, bio: tempBio };
  //   setProfile(updatedProfile);
  //   setIsEditingBio(false);
  // };

  // const saveLocation = (): void => {
  //   const updatedProfile = { ...profile, location: tempLocation };
  //   setProfile(updatedProfile);
  //   setIsEditingLocation(false);
  // };

  // const cancelEdit = (field: 'title' | 'bio' | 'location'): void => {
  //   switch(field) {
  //     case 'title':
  //       setTempTitle(profile.title);
  //       setIsEditingTitle(false);
  //       break;
  //     case 'bio':
  //       setTempBio(profile.bio);
  //       setIsEditingBio(false);
  //       break;
  //     case 'location':
  //       setTempLocation(profile.location);
  //       setIsEditingLocation(false);
  //       break;
  //   }
  // };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-lg h-32"></div>
      
      <div className="relative px-6 pb-6">
        {/* Avatar and Basic Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16 mb-6">
          <div className="relative mb-4 sm:mb-0">
            <img 
              src={profile.avatar} 
              alt={profile.name}
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-200"
            />
            <button className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg">
              <Camera size={16} />
            </button>
          </div>
          
          <div className="sm:ml-6 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <User className="text-gray-400" size={20} />
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Google Account
              </span>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <Mail className="text-gray-400" size={16} />
              <span className="text-gray-600">{profile.email}</span>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Google Account
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-700">Job Title</h3>
                {!isEditingTitle ? (
                  <Edit3 
                    size={16} 
                    className="text-gray-400 hover:text-blue-600 cursor-pointer"
                    onClick={() => setIsEditingTitle(true)}
                  />
                ) : (
                  <div className="flex gap-2">
                    <Save 
                      size={16} 
                      className="text-green-600 hover:text-green-700 cursor-pointer"
                      // onClick={saveTitle}
                    />
                    /<X 
                      size={16} 
                      className="text-red-500 hover:text-red-600 cursor-pointer"
                      // onClick={() => cancelEdit('title')}
                    />
                  </div>
                )}
              </div>
              {/* {isEditingTitle ? (
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  // onKeyPress={(e) => e.key === 'Enter' && saveTitle()}
                />
              ) : (
                <p className="text-gray-900">{profile.title}</p>
              )} */}
            </div>

            {/* Bio */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-700">Bio</h3>
                {!isEditingBio ? (
                  <Edit3 
                    size={16} 
                    className="text-gray-400 hover:text-blue-600 cursor-pointer"
                    onClick={() => setIsEditingBio(true)}
                  />
                ) : (
                  <div className="flex gap-2">
                    <Save 
                      size={16} 
                      className="text-green-600 hover:text-green-700 cursor-pointer"
                      // onClick={saveBio}
                    />
                    <X 
                      size={16} 
                      className="text-red-500 hover:text-red-600 cursor-pointer"
                      // onClick={() => cancelEdit('bio')}
                    />
                  </div>
                )}
              </div>
              {/* {isEditingBio ? (
                <textarea
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              )} */}
            </div>

            {/* Skills */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Award className="text-gray-600" size={20} />
                <h3 className="font-semibold text-gray-700">Skills & Technologies</h3>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {/* {profile.skills.map((skill, index) => (
                  <span 
                    key={skill}
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${skillColors[index % skillColors.length]}`}
                  >
                    {skill}
                    <X 
                      size={14} 
                      className="cursor-pointer hover:bg-black hover:bg-opacity-10 rounded-full"
                      onClick={() => removeSkill(skill)}
                    />
                  </span>
                ))} */}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add new skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  // onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <button
                  // onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Additional Info */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-700">Location</h3>
                {!isEditingLocation ? (
                  <Edit3 
                    size={16} 
                    className="text-gray-400 hover:text-blue-600 cursor-pointer"
                    onClick={() => setIsEditingLocation(true)}
                  />
                ) : (
                  <div className="flex gap-2">
                    <Save 
                      size={16} 
                      className="text-green-600 hover:text-green-700 cursor-pointer"
                      // onClick={saveLocation}
                    />
                    <X 
                      size={16} 
                      className="text-red-500 hover:text-red-600 cursor-pointer"
                      // onClick={() => cancelEdit('location')}
                    />
                  </div>
                )}
              </div>
              {/* {isEditingLocation ? (
                <input
                  type="text"
                  value={tempLocation}
                  onChange={(e) => setTempLocation(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && saveLocation()}
                />
              ) : (
                <p className="text-gray-600">{profile.location}</p>
              )} */}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Account Info</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Connected via Google</p>
                <p>Profile verified ✓</p>
                <p>Member since Jan 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;