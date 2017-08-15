export class Tag {
    private dbref: any;

    public solved: any;
    public chatId: string;

    constructor(dbref) {
        this.dbref = dbref;
    }

    // get solved tags
    get(uid){
        return this.dbref
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

        return this.dbref
            .child('users/' + uid + path)
            .update({
                [reply.tag]: message
            });
    }

    // add tag to solved
    postSolved(tag, uid){
        return this.dbref
            .child('users/' + uid + '/solvedTags')
            .update({
                [tag]: true
            });
    }
}