import React, { useState, useEffect } from 'react';
import { Button } from './button';

interface Member {
  userId: string;
  email: string;
  role: 'ADMIN' | 'TASK_COMPLETER';
}

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMembers: (members: Member[]) => Promise<void>;
  isLoading?: boolean;
}

interface ValidationErrors {
  [key: number]: {
    userId?: string;
    email?: string;
  };
}

const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSaveMembers,
}) => {
  const [members, setMembers] = useState<Member[]>([
    { userId: '', email: '', role: 'TASK_COMPLETER' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Validate individual member
  const validateMember = (member: Member, index: number): { userId?: string; email?: string } => {
    const memberErrors: { userId?: string; email?: string } = {};

    // Validate userId (email)
    if (!member.userId.trim()) {
      memberErrors.userId = 'Email is required';
    } else if (!emailRegex.test(member.userId.trim())) {
      memberErrors.userId = 'Please enter a valid email address';
    }

    return memberErrors;
  };

  // Validate all members and check for duplicates
  const validateAllMembers = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    const emailSet = new Set<string>();
    let hasDuplicates = false;

    members.forEach((member, index) => {
      const memberErrors = validateMember(member, index);
      
      // Check for duplicate emails
      const trimmedEmail = member.userId.trim().toLowerCase();
      if (trimmedEmail && emailSet.has(trimmedEmail)) {
        memberErrors.userId = 'This email is already added';
        hasDuplicates = true;
      } else if (trimmedEmail) {
        emailSet.add(trimmedEmail);
      }

      if (Object.keys(memberErrors).length > 0) {
        newErrors[index] = memberErrors;
      }
    });

    return newErrors;
  };

  // Check if form is valid
  const checkFormValidity = () => {
    const validationErrors = validateAllMembers();
    const hasValidMembers = members.some(member => 
      member.userId.trim() && !validationErrors[members.indexOf(member)]?.userId
    );
    
    setErrors(validationErrors);
    setIsFormValid(hasValidMembers && Object.keys(validationErrors).length === 0);
  };

  // Run validation whenever members change
  useEffect(() => {
    checkFormValidity();
  }, [members]);

  const handleAddMember = () => {
    setMembers([...members, { userId: '', email: '', role: 'TASK_COMPLETER' }]);
  };

  const handleRemoveMember = (index: number) => {
    if (members.length > 1) {
      const newMembers = members.filter((_, i) => i !== index);
      setMembers(newMembers);
      
      // Clean up errors for removed member
      const newErrors = { ...errors };
      delete newErrors[index];
      
      // Reindex errors for members after the removed one
      const reindexedErrors: ValidationErrors = {};
      Object.keys(newErrors).forEach(key => {
        const numKey = parseInt(key);
        if (numKey < index) {
          reindexedErrors[numKey] = newErrors[numKey];
        } else if (numKey > index) {
          reindexedErrors[numKey - 1] = newErrors[numKey];
        }
      });
      
      setErrors(reindexedErrors);
    }
  };

  const handleMemberChange = (index: number, field: keyof Member, value: string) => {
    const updatedMembers = members.map((member, i) =>
      i === index ? { ...member, [field]: value } : member
    );
    setMembers(updatedMembers);
    
    // Clear specific field error when user starts typing
    if (errors[index]?.[field]) {
      const newErrors = { ...errors };
      if (newErrors[index]) {
        delete newErrors[index][field];
        if (Object.keys(newErrors[index]).length === 0) {
          delete newErrors[index];
        }
      }
      setErrors(newErrors);
    }
  };

  const handleSave = async () => {
    // Final validation before save
    const validationErrors = validateAllMembers();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Filter out empty emails and prepare valid members
    const validMembers = members.filter(member => 
      member.userId.trim() !== '' && emailRegex.test(member.userId.trim())
    ).map(member => ({
      ...member,
      userId: member.userId.trim(),
      email: member.userId.trim() // Sync email field
    }));
    
    if (validMembers.length === 0) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      await onSaveMembers(validMembers);
      onClose();
      // Reset form on successful save
      setMembers([{ userId: '', email: '', role: 'TASK_COMPLETER' }]);
      setErrors({});
    } catch (error) {
      console.error('Error adding members:', error);
      // You might want to show a general error message here
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
    // Reset form when skipping
    setMembers([{ userId: '', email: '', role: 'TASK_COMPLETER' }]);
    setErrors({});
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
            <div key={index} className="space-y-2">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                    Member Email *
                  </label>
                  <input
                    type="email"
                    value={member.userId}
                    onChange={(e) => handleMemberChange(index, 'userId', e.target.value)}
                    className={`w-full px-3 py-2 rounded border ${
                      errors[index]?.userId 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500'
                    } dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2`}
                    placeholder="Enter member email"
                    aria-invalid={!!errors[index]?.userId}
                  />
                </div>
                
                <div className="w-40">
                  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                    Role
                  </label>
                  <select
                    value={member.role}
                    onChange={(e) => handleMemberChange(index, 'role', e.target.value as Member['role'])}
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-pointer"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="TASK_COMPLETER">Task Completer</option>
                  </select>
                </div>
                
                {members.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleRemoveMember(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400 hover:cursor-pointer"
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              {/* Error message for this member */}
              {errors[index]?.userId && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1">
                  {errors[index].userId}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleAddMember}
            className="w-full hover:cursor-pointer"
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
            className='hover:cursor-pointer'
          >
            Skip for Now
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading || !isFormValid}
            className={`hover:cursor-pointer ${
              !isFormValid && !isLoading 
                ? 'opacity-50 cursor-not-allowed' 
                : ''
            }`}
          >
            {isLoading ? 'Adding Members...' : 'Add Members'}
          </Button>
        </div>
        
        {/* Form validation summary */}
        {!isFormValid && Object.keys(errors).length === 0 && members.some(m => m.userId.trim()) && (
          <div className="mt-2 text-center">
            <p className="text-amber-600 dark:text-amber-400 text-sm">
              Please ensure all email addresses are valid
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberModal;