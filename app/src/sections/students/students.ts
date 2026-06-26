export type { Student } from './studentDetails';


export const getInitials = (name: string) => {
  return name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2);
};

export const getAvatarColor = (name: string) => {
  const colors = ['bg-[#3b82f6]', 'bg-[#22c55e]', 'bg-[#eab308]', 'bg-[#ef4444]', 'bg-[#8b5cf6]'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
