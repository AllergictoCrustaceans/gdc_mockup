import { User } from "./User";

export class Administrator extends User {
    protected accessLevel: 'super' | 'standard';
    protected permissions: string[];

    constructor(
        name: string,
        email: string,
        id: string,
        accessLevel: 'super' | 'standard' = 'standard',
    ) {
        super(name, email, id, 'administrator');
        this.accessLevel = accessLevel;
        this.permissions = this.initializePermissions(accessLevel);
    }

    private initializePermissions(level: 'super' | 'standard'): string[] {
        if (level === 'super') {
            return [
                'manage_all_events',
                'manage_all_users',
                'manage_venues',
                'view_all_analytics',
                'manage_payments',
                'system_settings',
                'delete_events',
                'delete_users',
            ];
        }
        return [
            'view_events',
            'view_users',
            'view_analytics',
            'manage_support_tickets',
        ];
    }

    // Permission Management
    public hasPermission(permission: string): boolean {
        return this.permissions.includes(permission);
    }

    public addPermission(permission: string): void {
        if (!this.permissions.includes(permission)) {
            this.permissions.push(permission);
        }
    }

    public removePermission(permission: string): void {
        this.permissions = this.permissions.filter(p => p !== permission);
    }

    public getPermissions(): string[] {
        return this.permissions;
    }

    // Access Level
    public getAccessLevel(): string {
        return this.accessLevel;
    }

    public isSuperAdmin(): boolean {
        return this.accessLevel === 'super';
    }

    public upgradeToSuper(): void {
        this.accessLevel = 'super';
        this.permissions = this.initializePermissions('super');
    }

    public downgradeToStandard(): void {
        this.accessLevel = 'standard';
        this.permissions = this.initializePermissions('standard');
    }

    // Get admin info
    public getAdministratorInfo() {
        return {
            ...this.getBasicInformation(),
            accessLevel: this.accessLevel,
            permissions: this.permissions,
            isSuperAdmin: this.isSuperAdmin(),
        };
    }
}
