import { BaseEntity, Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { MidiDto } from "common"

@Entity('midi')
export class Midi extends BaseEntity implements MidiDto {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column("int")
    chart: number;

    @Index({ fulltext: true })
    @Column("varchar")
    slug: string;

    @Index({ fulltext: true })
    @Column("text")
    name: string;

    @Column("float", {nullable: true})
    price: number

    @Column("varchar")
    file: string;

    @ManyToMany(() => Midi)
    @JoinTable()
    related: Midi[]
    
}