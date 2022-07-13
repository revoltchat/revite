// TODO: re-export from revolt-api in some way
declare type Session = {
    _id?: string;
    token: string;
    name: string;
    user_id: string;
};

declare type SessionPrivate = Session;
