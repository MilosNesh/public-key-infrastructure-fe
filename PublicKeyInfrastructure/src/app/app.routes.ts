import { Routes } from '@angular/router';
import { CsrFormComponent } from './csr-form/csr-form.component';
import { RegistrationComponent } from './auth/registration/registration.component';
import { RegistrationSuccessComponent } from './auth/registration-success/registration-success.component';
import { LoginComponent } from './auth/login/login.component';
import { RecoverComponent } from './auth/recover/recover.component';

export const routes: Routes = [
    {path: "registration", component: RegistrationComponent},
    {path: "registration-success", component: RegistrationSuccessComponent },
    {path: "login", component: LoginComponent},
    {path: "recover/:token", component: RecoverComponent},
    {path: 'csr', component: CsrFormComponent}
];
