import { Tag } from './tag';
import { Reply } from './reply';
import { Relationships, Genders } from '../../../diagram/models/meta.model';

export class Entity {
    private db: any;

    public current: string = "me";
    public entities: Array<string> = ["partner", "father", "mother"];
    public id: string;
    public reply: Reply;
    public tag: Tag;
    public user: any;

    constructor(db, user) {
        this.db = db;
        this.reply = new Reply(this.db);
        this.tag = new Tag(this.db);
        this.user = user;
        this.user.tag = "me";
    }

    // add new entity
    create(entity){
        const rel = Relationships[entity + this.user.tag + this.user.gender] || 'me';
        const revRel = Relationships[this.user.tag + entity + this.user.gender] || 'me';
        const gender = Genders[revRel] || "F";

        this.db.child('users')
        .push({
            entities: {
                [rel]: this.user.uid
            },
            info: {
                gender: gender
            },
            solvedTags: {
                [rel]: true
            }
        }).then((newEntity) => {
            this.id = newEntity.key;
            this.post(this.user.uid, revRel, newEntity.key);
            this.init();
        });
    }

    // initialize new entity
    init(){
        this.reply.reload(this.current);

        const goToNext = this.checkNext();
        if(goToNext === false) {
            this.next();
        }
    }

    solve(message){
        if(this.reply.current) {
            // reduces the gender message to M or F for entity: me
            if(this.reply.current.tag === 'gender' && this.current === 'me'){
                message = message[0].toUpperCase() === 'M' ? 'M':'F';
            }

            // update the user data
            // issue: changes the tags info for all other entities
            this.user[this.reply.current.tag] = message;
           
            this.tag.post(message, this.reply.current, this.id)
                .then(() => {
                    this.tag.postSolved(this.reply.current.tag, this.id)
                        .then(() => {
                            this.checkNext();
                        });
                });
        } else {
            this.next();
        } 
    }

    checkNext(){
        const goToNext = this.reply.next(this.current);
        if(goToNext){
            this.reply.post(this.user.chat);

            if(this.reply.current.skip){
                this.checkNext();
            }
        } else {
            return this.next();
        }
    }

    // add new entity to user
    post(uid, entity, entityId){
        return this.db.child("users/" + uid + '/entities')
        .update({
            [entity]: entityId
        });
    }

    // move to next entity
    next(){
        if(!this.entities.length) { return false; }

        // check if entity has already been solved
        if(this.user.entities && this.user.entities[this.entities[0]]){
            this.entities.shift();
            this.next();
            return false;
        }

        // check if user has a partner
        if(this.entities[0] === "partner") {
            if(this.user.partner !== "yes") {
                this.entities.shift();
                this.next();
                return false;
            }
        }

        // solve next entity
        this.current = this.entities[0];
        this.entities.shift();
        this.create(this.current);

        return true;
    } 
}