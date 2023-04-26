import PrimeVue from 'primevue/config';
import Card from 'primevue/card';
import Tooltip from 'primevue/tooltip';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Sidebar from 'primevue/sidebar';
import InputSwitch from 'primevue/inputswitch';
import ConfirmPopup from 'primevue/confirmpopup';
import ConfirmationService from 'primevue/confirmationservice';
import Splitter from 'primevue/splitter';
import SplitterPanel from "primevue/splitterpanel";
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ProgressSpinner from 'primevue/progressspinner';
import Chip from 'primevue/chip';
import Menubar from 'primevue/menubar';
import Tag from 'primevue/tag';
import Slider from 'primevue/slider';
import ScrollTop from 'primevue/scrolltop';

export default {
    install(app) {
        app.use(PrimeVue, { ripple: true });

        app.use(ConfirmationService);
        app.use(ToastService);

        app.component('Menubar', Menubar);
        app.component('Card', Card);
        app.component('Button', Button);
        app.component('Dropdown', Dropdown);
        app.component('Divider', Divider);
        app.component('InputText', InputText);
        app.component('Accordion', Accordion);
        app.component('AccordionTab', AccordionTab);
        app.component('Sidebar', Sidebar);
        app.component('InputSwitch', InputSwitch);
        app.component('ConfirmPopup', ConfirmPopup);
        app.component('Splitter', Splitter);
        app.component('SplitterPanel', SplitterPanel);
        app.component('Dialog', Dialog);
        app.component('Toast', Toast);
        app.component('DataTable', DataTable);
        app.component('Column', Column);
        app.component('ProgressSpinner', ProgressSpinner);
        app.component('Chip', Chip);
        app.component('Tag', Tag);
        app.component('Slider', Slider);
        app.component('ScrollTop', ScrollTop);

        app.directive('tooltip', Tooltip);
    }
};