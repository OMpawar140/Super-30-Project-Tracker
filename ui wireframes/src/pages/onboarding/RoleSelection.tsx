import React, { useState } from 'react';
import { HiLightningBolt, HiClipboardCheck } from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

type Role = 'creator' | 'completer' | null;

const RoleSelection: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role>(null);

  const handleContinue = () => {
    if (selectedRole) {
      // Add your role selection logic here
      console.log('Selected role:', selectedRole);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Role
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Select how you'll primarily use the platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div
            onClick={() => setSelectedRole('creator')}
            className="transform transition-all duration-200 hover:scale-105"
          >
            <Card
              variant="interactive"
              className={`h-full ${
                selectedRole === 'creator'
                  ? 'ring-2 ring-blue-500 ring-offset-2'
                  : ''
              }`}
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiLightningBolt className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Project Creator
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create and manage projects, set milestones, and oversee task completion
                </p>
                <ul className="text-left space-y-3">
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <span className="mr-2">✓</span> Create detailed project plans
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <span className="mr-2">✓</span> Set milestones and deadlines
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <span className="mr-2">✓</span> Track progress and manage teams
                  </li>
                </ul>
              </div>
            </Card>
          </div>

          <div
            onClick={() => setSelectedRole('completer')}
            className="transform transition-all duration-200 hover:scale-105"
          >
            <Card
              variant="interactive"
              className={`h-full ${
                selectedRole === 'completer'
                  ? 'ring-2 ring-blue-500 ring-offset-2'
                  : ''
              }`}
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiClipboardCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Task Completer
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Take on tasks, submit work, and collaborate with project creators
                </p>
                <ul className="text-left space-y-3">
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <span className="mr-2">✓</span> Access assigned tasks
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <span className="mr-2">✓</span> Submit completed work
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <span className="mr-2">✓</span> Receive AI-powered assistance
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>

        <div className="text-center">
          <Button
            size="lg"
            disabled={!selectedRole}
            onClick={handleContinue}
            className="px-12"
          >
            Continue as {selectedRole === 'creator' ? 'Project Creator' : selectedRole === 'completer' ? 'Task Completer' : '...'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection; 