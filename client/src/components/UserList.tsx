import { Card } from './ui/card';
import styles from './Chat.module.css';

interface UserListProps {
  users: string[];
}

export function UserList({ users }: UserListProps) {
  return (
    <div className={styles.usersList}>
      <div className={styles.usersTitle}>
        Active Users <span className={styles.userCount}>{users.length}</span>
      </div>
      <ul>
        {users.map((user, index) => (
          <li key={index} className={styles.userItem}>
            <div className={styles.userAvatar}>
              {user.charAt(0).toUpperCase()}
            </div>
            {user}
          </li>
        ))}
      </ul>
    </div>
  );
} 