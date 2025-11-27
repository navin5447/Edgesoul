'use client';

import React from 'react';
import Image from 'next/image';

interface ProfileIllustrationProps {
  gender?: 'male' | 'female' | 'other';
  theme?: string;
}

export const ProfileIllustration: React.FC<ProfileIllustrationProps> = ({ 
  gender = 'other',
  theme = 'default'
}) => {
  // Select image based on gender
  const imageSrc = gender === 'female' 
    ? '/images/profile-illustration-female.png'
    : '/images/profile-illustration.png';

  return (
    <div className="relative w-full h-64">
      <Image
        src={imageSrc}
        alt="Profile illustration"
        fill
        className="object-cover rounded-t-[2rem]"
        priority
      />
    </div>
  );
};

export default ProfileIllustration;
