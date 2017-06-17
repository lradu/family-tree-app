import { Component, AfterViewInit, Inject } from '@angular/core';

import { FirebaseApp } from 'angularfire2';

@Component({
  selector: 'diagram-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent implements AfterViewInit {
    public dbref: any;
    public user: any;

    public chatId: string;
    public messages: any = [];

    constructor(@Inject(FirebaseApp) firebase: any) {
        this.dbref = firebase.database().ref();
        this.user = firebase.auth().currentUser;
    }

    ngAfterViewInit() {
        // get the user's chat
        this.dbref
            .child('users/' + this.user.uid + '/chat')
            .once('value', (dataSnapshot) => {
                if(dataSnapshot.val()){
                    this.getMessages(dataSnapshot.val());
                } else {
                    this.createChat();
                } 
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

    // create a new chat
    createChat(){
        this.dbref
            .child('chats')
            .push({
                members: this.user.uid
            }).then((newChat) => {
                this.dbref
                    .child('users/' + this.user.uid)
                    .update({
                        chat: newChat.key
                    });
                this.getMessages(newChat.key);
            });
    }

    sendMessage(event, message){
        if(!event || !message || event.keyCode !== 13) return;

        let date = + new Date();
        this.dbref
            .child('messages/' + this.chatId)
            .push({
                'name': this.user.displayName || 'Anonymous',
                'message': message,
                'timestamp': date
            });
        event.srcElement.value = '';
    }
}
