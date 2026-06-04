export interface BaseEvent {
    timestamp: string;
    eventId?: string;
}

export interface UserCreatedEvent {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    type: string;
}