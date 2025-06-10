import React, { useState } from 'react';
import { Button } from './button';

interface Member {
  userId: string;
  role: 'ADMIN' | 'TASK_COMPLETER';
}

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMembers: (members: Member[]) => void;
}

const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSaveMembers,
}) => {
  const [members, setMembers] = useState<Member[]>([
    { userId: '', role: 'TASK_COMPLETER' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddMember = () => {
    setMembers([...members, { userId: '', role: 'TASK_COMPLETER' }]);
  };

  const handleRemoveMember = (index: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const handleMemberChange = (index: number, field: keyof Member, value: string) => {
    const updatedMembers = members.map((member, i) =>
      i === index ? { ...member, [field]: value } : member
    );
    setMembers(updatedMembers);
  };

  const handleSave = async () => {
    // Filter out empty emails
    const validMembers = members.filter(member => member.userId.trim() !== '');
    
    if (validMembers.length === 0) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      // Here you would typically call your API to add members to the project
      // await apiService.projects.addMembers(projectId, validMembers);
      
      onSaveMembers(validMembers);
      onClose();
    } catch (error) {
      console.error('Error adding members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Add Team Members
        </h2>
        
        <div className="space-y-4 mb-6">
          {members.map((member, index) => (
            <div key={index} className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                  Member Email
                </label>
                <input
                  type="email"
                  value={member.userId}
                  onChange={(e) => handleMemberChange(index, 'userId', e.target.value)}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter member email"
                />
              </div>
              
              <div className="w-40">
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                  Role
                </label>
                <select
                  value={member.role}
                  onChange={(e) => handleMemberChange(index, 'role', e.target.value as Member['role'])}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="TASK_COMPLETER">Task Completor</option>
                </select>
              </div>
              
              {members.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleRemoveMember(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleAddMember}
            className="w-full"
          >
            + Add Another Member
          </Button>
        </div>

        <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={handleSkip}
            disabled={isLoading}
          >
            Skip for Now
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Adding Members...' : 'Add Members'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MemberModal;