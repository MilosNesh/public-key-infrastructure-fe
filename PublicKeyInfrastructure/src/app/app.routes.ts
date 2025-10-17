import { Routes } from '@angular/router';
import { RegistrationComponent } from './auth/registration/registration.component';
import { RegistrationSuccessComponent } from './auth/registration-success/registration-success.component';

export const routes: Routes = [
    {path: "registration", component: RegistrationComponent},
    { path: 'registration-success', component: RegistrationSuccessComponent },

];
