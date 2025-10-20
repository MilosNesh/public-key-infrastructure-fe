import { Routes } from '@angular/router';
import { CsrFormComponent } from './csr-form/csr-form.component';
import { RegistrationComponent } from './auth/registration/registration.component';
import { RegistrationSuccessComponent } from './auth/registration-success/registration-success.component';
import { LoginComponent } from './auth/login/login.component';
import { RecoverComponent } from './auth/recover/recover.component';
import { HomeSrceenComponent } from './home-srceen/home-srceen.component';
import { PasswordFormComponent } from './password-form/password-form.component';
import { PasswordManagerComponent } from './password-manager/password-manager.component';
import { CertificateListComponent } from './certificate-list/certificate-list.component';
import { CertificateFormComponent } from './certificate-form/certificate-form.component';
import { AllCertificatesComponent } from './all-certificates/all-certificates.component';

export const routes: Routes = [
    {path: "", component: HomeSrceenComponent},
    {path: "registration", component: RegistrationComponent},
    {path: "registration-success", component: RegistrationSuccessComponent },
    {path: "login", component: LoginComponent},
    {path: "recover/:token", component: RecoverComponent},
    {path: 'csr', component: CsrFormComponent},
    {path: "password-form", component: PasswordFormComponent},
    {path: "password-manager", component: PasswordManagerComponent},
    {path: 'certificates', component: CertificateListComponent},
    {path: 'certificate-form', component: CertificateFormComponent},
    {path: 'all-certificates', component: AllCertificatesComponent}
];
