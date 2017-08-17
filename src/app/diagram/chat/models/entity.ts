import { Tag } from './tag';
import { Reply } from './reply';
import { relationships } from '../../../diagram/models/relationship.model';

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
        let rel = relationships[entity + this.user.tag + this.user.gender] || 'me';

        this.db.child('users')
        .push({
            entities: {
                [rel]: this.user.uid
            },
            solvedTags: {
                [rel]: true
            }
        }).then((newEntity) => {
            this.id = newEntity.key;
            this.post(this.user.uid, this.current, newEntity.key);
            this.init();
        });
    }

    // initialize new entity
    init(){
        this.reply.reload(this.current);
        if(this.reply.next(this.current)) {
            this.reply.post(this.user.chat);
        } else {
            const goToNext = this.next();
            if(goToNext) {
                this.reply.post(this.user.chat);
            } else {
                this.next(); 
            }
        };
    }

    solve(message){
       if(this.reply.current) {
            this.user[this.reply.current.tag] = message;
           
            this.tag.post(message, this.reply.current, this.id)
               .then(() => {
                   this.tag.postSolved(this.reply.current.tag, this.id)
                       .then(() => {
                           const goToNext = this.reply.next(this.current);
                           if(goToNext){
                               this.reply.post(this.user.chat);
                           } else {
                               this.next();
                           }
                       });
               });
       } else {
           this.next();
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