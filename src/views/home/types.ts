export interface Hitokoto {
    id: number;
    hitokoto: string;
    type: string;
    from: string;
    from_who: string | null;
    creator: string;
    created_at: string;
}
