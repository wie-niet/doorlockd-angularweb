// iTag|iUser|iUnkownTag
// iChangelog

// export iAnyObject = iTag|iUser|iUnkownTag;

export enum iObjType {
    tags = 'tags',
    users = 'users',
    unknowntags = 'unknown_tags',
} 

export interface iTag {
	id: number;
    hwid: string;
    description: string;
    is_disabled: boolean;
    created_at: string;
    updated_at: string;
}

export interface iUser {
    id: number;
    email: string;
    password_hash?: string;
    password_plain?: string;
    is_disabled: boolean;
    created_at: string;
    updated_at: string;
}

export interface iUnknownTag {
    id: number;
    hwid: string;
    created_at: string;
    updated_at: string;
}

export interface iChangelog {
    id: number;
    now: string;
    user_id: number;
    changelogger_id: number;
    action: string;
    prev: string;
    diff: Array<iChangelogDiff>;
    changelogger_type: string;
}

export interface iChangelogDiff {
    value: any;
    path: string;
    op: string;
}

export interface iHardwareItem {
    [key: string]: any;
}

// AuthResp json response for:
//  * /api/refresh_token/		[POST] 
//  * /api/login/				[POST] 

export interface AuthResp {
	status: boolean;
    error: string;
    message: string;
    token: string;
}
