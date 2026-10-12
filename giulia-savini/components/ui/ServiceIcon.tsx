import { HeartHandshake, MonitorSmartphone, Sprout, User, Users, type LucideProps } from 'lucide-react';
import type { Service } from '@/data/profile';

const icons = {
    user: User,
    couple: Users,
    sexology: HeartHandshake,
    parenting: Sprout,
    online: MonitorSmartphone
} satisfies Record<Service['icon'], unknown>;

export function ServiceIcon({ name, ...props }: { name: Service['icon'] } & LucideProps) {
    const Icon = icons[name];
    return <Icon aria-hidden strokeWidth={1.25} {...props} />;
}
