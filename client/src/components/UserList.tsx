import { Card } from '@/components/ui/card';

interface UserListProps {
  users: string[];
  currentUser: string;
}

export function UserList({ users, currentUser }: UserListProps) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-2">Active Users ({users.length})</h3>
      <div className="space-y-1">
        {users.map((username) => (
          <div
            key={username}
            className={`text-sm px-2 py-1 rounded ${
              username === currentUser
                ? 'bg-blue-100 text-blue-800'
                : 'text-gray-600'
            }`}
          >
            {username}
          </div>
        ))}
      </div>
    </Card>
  );
} 