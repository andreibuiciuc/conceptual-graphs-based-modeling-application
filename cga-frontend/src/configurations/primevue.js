import "primevue/resources/themes/lara-light-blue/theme.css";     
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

// PrimeVue configuration
import PrimeVue from 'primevue/config';

// Primevue services
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

// PrimeVue components
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Chip from 'primevue/chip';
import Chips from 'primevue/chips'
import ColorPicker from 'primevue/colorpicker';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import ConfirmPopup from 'primevue/confirmpopup';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import Dropdown from 'primevue/dropdown';
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Menubar from 'primevue/menubar';
import ProgressSpinner from 'primevue/progressspinner';
import ScrollTop from 'primevue/scrolltop';
import Sidebar from 'primevue/sidebar';
import Skeleton from 'primevue/skeleton'
import Slider from 'primevue/slider';
import Splitter from 'primevue/splitter';
import SplitterPanel from "primevue/splitterpanel";
import Tag from 'primevue/tag';
import Timeline from 'primevue/timeline';
import Toast from 'primevue/toast';
import Tooltip from 'primevue/tooltip';

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
        app.component('Timeline', Timeline);
        app.component('Skeleton', Skeleton);
        app.component('ColorPicker', ColorPicker);
        app.component('Chips', Chips);
        app.component('ConfirmDialog', ConfirmDialog);
        app.component('Message', Message);

        app.directive('tooltip', Tooltip);
    }
};