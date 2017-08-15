import { Component, AfterViewInit, Inject } from '@angular/core';

import { FirebaseApp } from 'angularfire2';
import { Entity } from './models/entity'

@Component({
  selector: 'diagram-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent implements AfterViewInit {
    private dbref: any;

    private entity: Entity;
    private messages: any = [];
    private user: any = {};

    constructor(@Inject(FirebaseApp) firebase: any) {
        this.dbref = firebase.database().ref();
        this.user.uid = firebase.auth().currentUser.uid;

        this.entity = new Entity(this.dbref, this.user);
    }

    ngAfterViewInit() {
        this.entity.id = this.user.uid;
        
        // get the user's chat
        this.dbref
            .child('users/' + this.user.uid)
            .once('value', (snapshot) => {
                if(snapshot.val()){
                    Object.assign(this.user, snapshot.val());
                }

                this.entity.reply.get()
                    .then(() => {
                        if(this.user.chat){
                            this.get();
                        } else {
                            this.create();
                        }
                    });
            });
    }

    // create a new chat
    create(){
        return this.dbref
            .child('chats')
            .push({
                user: this.user.uid
            }).then((newChat) => {
                this.user.chat = newChat.key;
                this.dbref
                    .child('users/' + this.user.uid)
                    .update({
                        chat: newChat.key
                    });

                const hello = 'Hi, I can help you build a family tree.';
                this.post(hello, 'AI');


                this.get();
                this.entity.init();
            });
    }

    // get chat messages
    get(){
        this.dbref
            .child('messages/' + this.user.chat)
            .on('child_added', (snapshot) => {
                this.messages.unshift(snapshot.val());
        });
    }

    // post message
    post(message, name){
        const date = + new Date();
        this.dbref
            .child('messages/' + this.user.chat)
            .push({
                'name': name,
                'message': message,
                'timestamp': date
            });
    }

    handleInput(event, message){
        if(!event || !message || event.keyCode !== 13) return;

        const name = this.user.name || 'Anonymous';
        this.post(message, name)
        this.entity.solve(message);

        event.srcElement.value = '';
    }
}
