import { Routes } from '@angular/router';
import { CsrFormComponent } from './csr-form/csr-form.component';
import { RegistrationComponent } from './auth/registration/registration.component';
import { RegistrationSuccessComponent } from './auth/registration-success/registration-success.component';
import { LoginComponent } from './auth/login/login.component';
import { RecoverComponent } from './auth/recover/recover.component';
import { HomeSrceenComponent } from './home-srceen/home-srceen.component';
import { PasswordFormComponent } from './password-form/password-form.component';
import { PasswordManagerComponent } from './password-manager/password-manager.component';
import { CertificateFormComponent } from './certificate-form/certificate-form.component';
import { AllCertificatesComponent } from './all-certificates/all-certificates.component';
import { CsrListComponent } from './csr-list/csr-list.component';
import { TemplateFormComponent } from './template-form/template-form.component';
import { RegistrationCaUserComponent } from './auth/registration-ca-user/registration-ca-user.component';

export const routes: Routes = [
    {path: "", component: HomeSrceenComponent},
    {path: "registration", component: RegistrationComponent},
    {path: "registration-success", component: RegistrationSuccessComponent },
    {path: "login", component: LoginComponent},
    {path: "recover/:token", component: RecoverComponent},
    {path: 'csr', component: CsrFormComponent},
    {path: "password-form", component: PasswordFormComponent},
    {path: "password-manager", component: PasswordManagerComponent},
    {path: 'certificate-form', component: CertificateFormComponent},
    {path: 'all-certificates', component: AllCertificatesComponent},
    {path: 'csr-list', component: CsrListComponent},
    {path: 'template-form', component: TemplateFormComponent},
    {path: 'register-ca-user', component: RegistrationCaUserComponent}
];
