import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { BrandsComponent } from './pages/brands/brands.component';
import { BookingComponent } from './pages/booking/booking.component';
import { DisconnectionComponent } from './pages/disconnection/disconnection.component';
import { DiscoComponent } from './pages/disco/disco.component';
import { StregaSkyComponent } from './pages/strega-sky/strega-sky.component';
import { ElephantComponent } from './pages/elephant/elephant.component';
import { GrafiteriaComponent } from './pages/grafiteria/grafiteria.component';
import { Grafiteria2Component } from './pages/grafiteria2/grafiteria2.component';
import { DiscoPilsenComponent } from './pages/disco-pilsen/disco-pilsen.component';
import { DiscoPilsen2Component } from './pages/disco-pilsen2/disco-pilsen2.component';
import { BookingEnComponent } from './pages/booking-en/booking-en.component';
import { SolarBookingComponent } from './pages/solar-booking/solar-booking.component';
import { CasagarboCrisComponent } from './pages/casagarbo-cris/casagarbo-cris.component';
import { ValidacionQrComponent } from './pages/validacion-qr/validacion-qr.component';
import { CasagarboBlacklistComponent } from './pages/casagarbo-blacklist/casagarbo-blacklist.component';
import { CasaGarboChandonComponent } from './pages/casa-garbo-chandon/casa-garbo-chandon.component';
import { GarboDiaComponent } from './pages/garbo-dia/garbo-dia.component';
import { GarageComponent } from './pages/garage/garage.component';
import { AniversarioElephantComponent } from './pages/aniversario-elephant/aniversario-elephant.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { Garage2Component } from './pages/garage2/garage2.component';
import { PayasoLocoPageComponent } from './pages/payaso-loco/payaso-loco.page';
import { LilaTakeoverComponent } from './pages/lila-takeover/lila-takeover.component';
import { LilaTakeoverDashboardComponent } from './pages/lila-takeover-dashboard/lila-takeover-dashboard.component';
export const routes: Routes = [

    {
        path: 'lila-takeover',
        component: LilaTakeoverComponent
    },
    {
        path: 'lila-takeover-dashboard',
        component: LilaTakeoverDashboardComponent
    },
    {
        path: 'disco-pilsen',
        component: DiscoPilsenComponent
    },
    {
        path: 'disco-pilsen2',
        component: DiscoPilsen2Component
    },
    {
        path: 'disco',
        component: DiscoComponent
    },
    {
        path: 'disconnection-opening',
        component: DisconnectionComponent
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'brands',
        component: BrandsComponent
    },
    {
        path: 'strega-sky',
        component: StregaSkyComponent
    },
    {
        path: 'elephant',
        component: ElephantComponent
    },
    {
        path: 'grafiteria',
        component: GrafiteriaComponent
    },
    {
        path: 'graffiteria',
        component: Grafiteria2Component
    },
    {
        path: 'booking-en',
        component: BookingEnComponent
    },
    {
        path: 'solar-booking',
        component: SolarBookingComponent
    },
    {
        path: 'casagarbo-cris',
        component: CasagarboCrisComponent
    },
    {
        path: 'validacion-qr',
        component: ValidacionQrComponent
    },
    {
        path: 'casagarbo-blacklist',
        component: CasagarboBlacklistComponent
    },
    {
        path: 'casa-garbo-chandon',
        component: CasaGarboChandonComponent
    },
    {
        path: 'garbo-dia',
        component: GarboDiaComponent
    },
    {
        path: 'garage',
        component: GarageComponent
    },
    {
        path: 'garage2',
        component: Garage2Component
    },
    {
        path: '3-aniversario-elephant',
        component: AniversarioElephantComponent
    },
    {
        path: 'payaso-loco',
        component: PayasoLocoPageComponent
    },
    {
        path: '404',
        component: NotFoundComponent
    },
    {
        path: '',
        component: BookingComponent
    },
    {
        path: '**',
        component: NotFoundComponent
    }
];
