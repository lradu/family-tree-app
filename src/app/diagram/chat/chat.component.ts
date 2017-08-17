import { Component, AfterViewInit, Inject } from '@angular/core';

import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Entity } from './models/entity'

@Component({
  selector: 'diagram-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent implements AfterViewInit {
    private db: any;
    private user: any = {};
    public entity: Entity;
    public messages: any = [];


    constructor(db: AngularFireDatabase, auth: AngularFireAuth) {
        this.db = db.database.ref();
        const user = auth.auth.currentUser
        if(user){
            this.user.uid = user.uid;
        }
        this.entity = new Entity(this.db, this.user);
    }

    ngAfterViewInit() {
        this.entity.id = this.user.uid;
        
        // get the user's chat
        this.db
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
        return this.db
            .child('chats')
            .push({
                user: this.user.uid
            }).then((newChat) => {
                this.user.chat = newChat.key;
                this.db
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
        this.db
            .child('messages/' + this.user.chat)
            .on('child_added', (snapshot) => {
                this.messages.unshift(snapshot.val());
        });
    }

    // post message
    post(message, name){
        const date = + new Date();
        this.db
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
