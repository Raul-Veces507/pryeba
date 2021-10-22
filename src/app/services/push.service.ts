import { Injectable,EventEmitter } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import {Storage} from '@ionic/storage';


@Injectable({
  providedIn: 'root'
})
export class PushService {

  mensajes:OSNotificationPayload []=[]

  userId:string;

  pushListener=new EventEmitter<OSNotificationPayload>();

  constructor(private oneSignal: OneSignal,private storage:Storage) { 
    this.cargarMensajes();
  }

  async getMensajes(){
    await this.cargarMensajes();
    return [...this.mensajes];
  }

  configuracionInicial(){

          // direccion fisica del dispositivo
          this.oneSignal.startInit('980befd7-0b6d-4ce4-9251-5af267c547d3','860646788815');
        
          //como mandaremos la alerta 
          this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);


          //  que hacer ala hora de recibir la notificacion
          this.oneSignal.handleNotificationReceived().subscribe((noti) => {
            this.notificacionRecibida(noti)
            console.log('Notificacion recibida',noti)
          });


          //  que hacer ala hora de abrir la notificacion
          this.oneSignal.handleNotificationOpened().subscribe(async (noti) => {
        
            console.log('Notificacion abierta',noti)
          await this.notificacionRecibida(noti.notification);
          });

          this.oneSignal.getIds().then(info=>{
            info.userId=info.userId
          })

          this.oneSignal.endInit();
                    }

       async notificacionRecibida(noti: OSNotification){

        await this.cargarMensajes();

        const payload=noti.payload;

        const Existepush=this.mensajes.find(mensaje=> mensaje.notificationID===
          payload.notificationID);

          if(Existepush){
            return;
          }
               this.mensajes.unshift(payload);
               this.pushListener.emit(payload);
        await  this.guardarmensajes();
      }
      guardarmensajes(){
        this.storage.set('mensajes',this.mensajes);
      }
      async cargarMensajes(){
     this.mensajes=  await this.storage.get('mensajes')||[]
     return this.mensajes;
      }         
}
