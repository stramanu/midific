
export declare interface MidiDto {
    id: number;
    slug: string;
    name: string;
    price: number
}

export declare interface MidiCartDto extends MidiDto {
    checked: boolean;
}