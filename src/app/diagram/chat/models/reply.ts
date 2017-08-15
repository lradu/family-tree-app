export class Reply {
    private dbref: any;

    public current: any;
    public all = [];
    public queue = [];

    constructor(dbref) {
        this.dbref = dbref;
    }

    // get replies
    get() {
        return this.dbref
            .child('replies')
            .orderByChild('priority')
            .once('value', (snapShot) => {
                snapShot.forEach((reply) => {
                   this.all.push(reply.val());
                   this.queue.push(reply.val());
                });
            });
    }

    // get next reply
    next(entity){
        if(!this.queue.length) {
            this.current = null;
            return false;
        }

        this.current = Object.assign({}, this.queue[0]);
        this.queue.shift();
        this.process(entity);

        return true;
    }

    // set replies for a new entity
    reload(entity){
        this.queue = this.all.filter((reply) => {
            return reply.entity === entity || reply.entity === 'all';
        });
    }

    // formulate reply message based on current entity
    process(entity){
        if(this.current.entity === "all"){
            let message = this.current.message;
            if(entity === "me"){
                message =  this.current.message
                    .replace('{$entity}', this.current.me)
                    .replace('{$tag}', '');
                this.current.message = message;
            } else {
                message = this.current.message
                    .replace('{$entity}', this.current.all)
                    .replace('{$tag}', entity);
                this.current.message = message;
            }
        }
    }

    // add reply to chat
    post(id){
        const date = + new Date();
        return this.dbref
            .child('messages/' + id)
            .push({
                'message': this.current.message,
                'name': this.current.name,
                'timestamp': date
            });
    }
   
}