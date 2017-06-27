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
    private showChatInput: boolean = false;
    private messages: any = [];
    private replies: any = [];
    private currentReply: any = {};

    constructor(@Inject(FirebaseApp) firebase: any) {
        this.dbref = firebase.database().ref();
        this.user = firebase.auth().currentUser;
    }

    ngAfterViewInit() {
        if(!this.user) { return; };
        
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
                    this.getSolvedTags(chat);
                } else {
                    this.getReplies(null)
                        .then(() => {
                           this.createChat(); 
                        });
                } 
        });
    }

    // create a new chat
    createChat(){
        return this.dbref
            .child('chats')
            .push({
                user: this.user.uid
            }).then((newChat) => {
                this.dbref
                    .child('users/' + this.user.uid)
                    .update({
                        chat: newChat.key
                    });
                this.getMessages(newChat.key);
                this.getNextReply();
                this.postSolvedTag(newChat.key, this.currentReply.tag);
                this.getNextReply();
                this.postSolvedTag(newChat.key, this.currentReply.tag);
            });
    }

    // get chat messages
    getMessages(chatId){
        this.chatId = chatId;
        this.dbref
            .child('messages/' + chatId)
            .on('child_added', (snapshot) => {
                this.messages.push(snapshot.val());
        });
    }

    // save user input
    postMessage(event, message){
        if(!event || !message || event.keyCode !== 13) return;

        let date = + new Date();
        this.dbref
            .child('messages/' + this.chatId)
            .push({
                'name': this.userData.name || 'Anonymous',
                'message': message,
                'timestamp': date
            });

        this.userData[this.currentReply.tag] = message;

        this.postTag(message)
            .then(() => {
                this.postSolvedTag(this.chatId, this.currentReply.tag)
                    .then(() => {
                        this.getNextReply();
                    });
            });

        event.srcElement.value = '';
    }

    // check entity
    checkEntity(){

    }

    // add tag to entity
    postTag(res){
        return this.dbref
            .child('users/' + this.user.uid)
            .update({
                [this.currentReply.tag]: res
            });
    }

    // add tag to solved
    postSolvedTag(chatId, tag){
        return this.dbref
            .child('chats/' + chatId + '/solvedTags')
            .update({
                [tag]: true
            });
    }

    // get solved replies tags
    getSolvedTags(chatId){
        return this.dbref
            .child('chats/' + chatId + '/solvedTags')
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
                        if(!solvedTags[reply.val().tag]){
                            this.replies.push(reply.val());
                        }
                    });
                } else {
                    snapShot.forEach((reply) => {
                        this.replies.push(reply.val());
                    });
                }
            }).then(() => {
                this.showChatInput = true;
            });
    }

    getNextReply(){
        if(!this.replies.length) return;

        let date = + new Date();
        this.replies[0].timestamp = date;
        this.currentReply = this.replies[0];
        this.replies.shift();

        this.dbref
            .child('messages/' + this.chatId)
            .push(this.currentReply);
    }   
}
