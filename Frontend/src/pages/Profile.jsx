import { Avatar, AvatarImage, AvatarFallback } from "@/components/atoms/Avatar";

export default function Profile() {
  // Static dummy user
  const user = {
    name: "Sudhir Sharma",
    email: "sudhir@example.com",
    picture: "/me.png",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-background text-foreground p-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="flex flex-col items-center space-y-4">
        {/* Avatar */}
        <Avatar className="w-32 h-32">
          <AvatarImage src={user.picture} alt={user.name} />
          <AvatarFallback>
            <span className="text-4xl">👤</span>
          </AvatarFallback>
        </Avatar>

        {/* User Info */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 w-full max-w-md flex flex-col gap-4">
        <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer">
          Edit Profile
        </button>
        <button className="px-4 py-2 rounded-md bg-destructive text-white hover:bg-destructive/90 transition-colors cursor-pointer">
          Logout
        </button>
      </div>
    </div>
  );
}
