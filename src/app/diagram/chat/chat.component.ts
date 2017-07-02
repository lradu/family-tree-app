import { Component, AfterViewInit, Inject } from '@angular/core';

import { FirebaseApp } from 'angularfire2';

@Component({
  selector: 'diagram-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent implements AfterViewInit {
    private dbref: any;
    private user: any;

    private userData: any = {};
    private chatId: string;
    private messages: any = [];

    private replies: any = [];
    private currentReply: any;

    private currentEntity: string = "me";
    private entityId: string;
    private entities: Array<string> = ["partner", "father", "mother"];

    constructor(@Inject(FirebaseApp) firebase: any) {
        this.dbref = firebase.database().ref();
        this.user = firebase.auth().currentUser;
    }

    ngAfterViewInit() {
        if(!this.user) { return; };

        this.entityId = this.user.uid;
        
        // get the user's chat
        this.dbref
            .child('users/' + this.user.uid)
            .once('value', (dataSnapshot) => {
                let chat;
                if(dataSnapshot.val()){
                    this.userData = dataSnapshot.val();
                    chat = this.userData.chat;
                }

                if(chat){
                    this.getMessages(chat);
                    this.getSolvedTags(this.user.uid);
                } else {
                    this.getReplies(null)
                        .then(() => {
                            this.createChat(this.user.uid);
                        });
                } 
        });
    }

    // create a new chat
    createChat(uid){
        return this.dbref
            .child('chats')
            .push({
                user: uid
            }).then((newChat) => {
                this.dbref
                    .child('users/' + uid)
                    .update({
                        chat: newChat.key
                    });

                this.getMessages(newChat.key);

                // Get greeting message
                this.getNextReply();
                this.postReply();
                this.postSolvedTag(this.currentReply.tag);

                // Get first question
                this.getNextReply();
                this.processNextReply();
                this.postReply();
            });
    }

    // get chat messages
    getMessages(chatId){
        this.chatId = chatId;
        this.dbref
            .child('messages/' + chatId)
            .on('child_added', (snapshot) => {
                this.messages.unshift(snapshot.val());
        });
    }

    // get solved replies tags
    getSolvedTags(uid){
        return this.dbref
            .child('users/' + uid + '/solvedTags')
            .once('value', (snapShot) => {
                this.getReplies(snapShot.val());
            });
    }

    // get replies
    getReplies(solvedTags) {
        return this.dbref
            .child('replies')
            .orderByChild('priority')
            .once('value', (snapShot) => {
                if(solvedTags){
                    snapShot.forEach((reply) => {
                        if(!solvedTags[reply.val().tag] && (reply.val().entity === this.currentEntity || reply.val().entity === "all")) {
                            this.replies.push(reply.val());
                        }
                    });
                } else {
                    snapShot.forEach((reply) => {
                        if(reply.val().entity === this.currentEntity || reply.val().entity === "all"){
                            this.replies.push(reply.val());
                        }
                    });
                }
            });
    }

    // save user input
    postMessage(event, message){
        if(!event || !message || event.keyCode !== 13) return;

        const date = + new Date();
        this.dbref
            .child('messages/' + this.chatId)
            .push({
                'name': this.userData.name || 'Anonymous',
                'message': message,
                'timestamp': date
            });

        if(this.currentReply || this.replies.length) {
            if(!this.currentReply) { this.getNextReply() };
            this.userData[this.currentReply.tag] = message;
            
            this.postTag(message)
                .then(() => {
                    this.postSolvedTag(this.currentReply.tag)
                        .then(() => {
                            let goToNext = this.getNextReply();
                            if(goToNext){
                                this.processNextReply();
                                this.postReply();
                            }
                        });
                });
        } else {
            this.getNextEntity();
        }

        event.srcElement.value = '';
    }

    // add tag to entity
    postTag(res){
        let path = '';
        if(this.currentReply.saveTag) {
            path = '/info';
        }

        return this.dbref
            .child('users/' + this.entityId + path)
            .update({
                [this.currentReply.tag]: res
            });
    }

    // add tag to solved
    postSolvedTag(tag){
        return this.dbref
            .child('users/' + this.entityId + '/solvedTags')
            .update({
                [tag]: true
            });
    }

    // get next reply
    getNextReply(){
        if(!this.replies.length) {
            this.currentReply = null;
            this.getNextEntity();

            return false;
        }

        const date = + new Date();
        this.replies[0].timestamp = date;
        this.currentReply = this.replies[0];
        this.replies.shift();

        return true;
    }

    // formulate reply message based on current entity
    processNextReply(){
        if(this.currentReply.entity === "all"){
            let message = this.currentReply.message;
            if(this.currentEntity === "me"){
                message =  this.currentReply.message
                    .replace('{$entity}', this.currentReply.me);
                this.currentReply.message = message;
            } else {
                message = this.currentReply.message
                    .replace('{$entity}', this.currentEntity + "'s " + this.currentReply.tag);
                this.currentReply.message = message;
            }
        }
    }

    // add reply to chat
    postReply(){
        return this.dbref
            .child('messages/' + this.chatId)
            .push(this.currentReply);
    }

    // move to next entity
    getNextEntity(){
        if(!this.entities.length) { return false; }

        if(this.userData.entities && this.userData.entities[this.entities[0]]){
            this.entities.shift();
            this.getNextEntity();
            return false;
        } // todo

        if(this.entities[0] === "partner") {
            if(this.userData.partner !== "yes") {
                this.entities.shift();
                this.getNextEntity();
                return false;
            }
        }

        this.currentEntity = this.entities[0];
        this.entities.shift();

        const entity = this.createEntity(this.currentEntity, this.currentEntity, this.user.uid);
        entity.then((newEntity) => {
            this.entityId = newEntity.key;

            this.postEntity(this.user.uid, this.currentEntity, newEntity.key);
            this.postEntity(newEntity.key, this.currentEntity, this.user.uid);

            this.getReplies(null);
        })
    }

    // add entity tag
    postEntity(uid, entity, entityId){
        return this.dbref.child("users/" + uid + '/entities')
            .update({
                [entity]: entityId
            });
    }

    // add new entity
    createEntity(tag, entity, entityId){
        return this.dbref.child('users')
            .push({
                entities: {
                    [entity]: true
                },
                solvedTags: {
                    [tag]: true
                }
            });
    }
}
