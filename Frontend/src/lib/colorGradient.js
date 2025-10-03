const avatarGradients = [
  "bg-gradient-to-r from-pink-500 to-red-500 text-white",
  "bg-gradient-to-r from-indigo-500 to-blue-500 text-white",
  "bg-gradient-to-r from-green-400 to-emerald-600 text-white",
  "bg-gradient-to-r from-purple-500 to-pink-600 text-white",
  "bg-gradient-to-r from-orange-400 to-red-500 text-white",
  "bg-gradient-to-r from-teal-400 to-cyan-500 text-white",
  "bg-gradient-to-r from-amber-500 to-yellow-400 text-black",
  "bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white",
  "bg-gradient-to-r from-lime-400 to-green-600 text-black",
];

export function getAvatarGradient(idx) {
  return avatarGradients[idx % avatarGradients.length];
}
