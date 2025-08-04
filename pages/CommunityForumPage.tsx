import React from 'react';
import ChatBubbleLeftRightIcon from '../components/icons/ChatBubbleLeftRightIcon.tsx';
import LinkToComingSoon from '../components/LinkToComingSoon.tsx'; // Import shared component

const CommunityForumPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-textPrimary">Community Support Forum</h2>
      </div>
      <div className="bg-surface p-8 rounded-xl shadow-lg text-center">
        <ChatBubbleLeftRightIcon className="w-16 h-16 text-primary mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-textPrimary mb-3">Connect & Share</h3>
        <p className="text-textSecondary max-w-md mx-auto">A supportive space for users to anonymously share experiences, advice, and find support on various health topics. This feature is currently in development.</p>
        <div className="mt-6">
            <LinkToComingSoon />
        </div>
      </div>
    </div>
  );
};

export default CommunityForumPage;
