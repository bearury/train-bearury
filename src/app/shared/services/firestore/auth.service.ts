import { inject, Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updateProfile,
} from '@angular/fire/auth';

import { User } from 'firebase/auth';
import {
  catchError,
  from,
  mergeMap,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';

@Injectable({
  providedIn: 'root',
})
export class AuthFirestoreService {
  private readonly auth = inject(Auth);

  public signUp(
    email: string,
    password: string,
    name: string
  ): Observable<User | null> {
    return fromPromise(
      createUserWithEmailAndPassword(this.auth, email, password)
    ).pipe(
      tap((userCredential) => {
        return updateProfile(userCredential.user, { displayName: name });
      }),
      tap((userCredential) => sendEmailVerification(userCredential.user)),
      // tap((userCredential) => {
      // this.alerts
      //   .open('', {
      //     label: `Ссылка для подтверждения почты, отправлена на почту ${userCredential.user.email}`,
      //     appearance: 'info',
      //   })
      //   .subscribe();
      // }),
      switchMap((userCredential) => of(userCredential.user)),
      catchError((error) => {
        // this.alerts
        //   .open('', { label: error, appearance: 'negative' })
        //   .subscribe();
        return of(null);
      })
    );
  }

  public signIn(email: string, password: string): Observable<User | null> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      mergeMap((userCredential) => {
        const user = userCredential.user;
        if (!user.emailVerified) {
          // this.alerts
          //   .open('Проверьте почту для подтверждения', {
          //     label: 'Почта не подтверждена',
          //     appearance: 'negative'
          //   })
          //   .subscribe();
          this.auth.signOut();
          return of(null);
        } else {
          if (userCredential.user.uid) {
            // return this.usersFirestoreService
            //   .getUser(userCredential.user.uid)
            //   .pipe(
            //     mergeMap((userData) => {
            //       if (!userData) {
            //         return this.usersFirestoreService
            //           .createUser({
            //             uid: userCredential.user.uid,
            //             email: userCredential.user.email || '',
            //             name: userCredential.user.displayName || '',
            //           })
            //           .pipe(map(() => user));
            //       } else {
            //         return of(user);
            //       }
            //     })
            //   );

            console.info(
              '[164] 🥕: Если юзер верификационный, то надо создать запись в БД'
            );
            return of(null);
          } else {
            return of(null);
          }
        }
      }),

      catchError((error) => {
        // this.alerts
        //   .open('Ошибка входа', {
        //     label: 'Не верный логин или пароль',
        //     appearance: 'negative',
        //   })
        //   .subscribe();
        console.warn('🚨: ', error);
        return of(null);
      })
    );
  }

  public signOut(): Observable<void> {
    return from(this.auth.signOut()).pipe(
      tap(() => console.log('[171] 🚧: Успешный выход пользователя'))
    );
  }
}
