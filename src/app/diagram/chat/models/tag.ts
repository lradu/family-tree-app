export class Tag {
    private db: any;

    public solved: any;
    public chatId: string;

    constructor(db) {
        this.db = db;
    }

    // get solved tags
    get(uid){
        return this.db
            .child('users/' + uid + '/solvedTags')
            .once('value', (snapShot) => {
                this.solved = snapShot.val();
            });
    }

    // add tag to entity
    post(message, reply, uid){
        let path = '';
        if(reply.saveTag) {
            path = '/info';
        }

        return this.db
            .child('users/' + uid + path)
            .update({
                [reply.tag]: message
            });
    }

    // add tag to solved
    postSolved(tag, uid){
        return this.db
            .child('users/' + uid + '/solvedTags')
            .update({
                [tag]: true
            });
    }
}