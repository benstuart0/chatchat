import { Card } from '@/components/ui/card';

interface UserListProps {
  users: string[];
}

export function UserList({ users }: UserListProps) {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-2">Active Users ({users.length})</h3>
      <div className="space-y-1">
        {users.map((user, index) => (
          <div
            key={index}
            className="text-sm py-1 px-2 rounded bg-gray-100"
          >
            {user}
          </div>
        ))}
      </div>
    </Card>
  );
} 