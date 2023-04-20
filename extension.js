const {Gio, GObject} = imports.gi;
const QuickSettings = imports.ui.quickSettings;
const QuickSettingsMenu = imports.ui.main.panel.statusArea.quickSettings;
const Main = imports.ui.main;


const FeatureToggle = GObject.registerClass(
class FeatureToggle extends QuickSettings.QuickToggle {
    _init() {
        super._init({
            title: 'Screen Keyboard',
            iconName: 'input-keyboard-symbolic',
            toggleMode: true,
        });
        
        // NOTE: In GNOME 44, the `label` property must be set after
        // construction. The newer `title` property can be set at construction.
        this.label = 'Screen Keyboard';

        // Binding the toggle to a GSettings key
        this._settings = new Gio.Settings({
            schema_id: 'org.gnome.desktop.a11y.applications',
        });

        this._settings.bind('screen-keyboard-enabled',
            this, 'checked',
            Gio.SettingsBindFlags.DEFAULT);
    }
});

const FeatureIndicator = GObject.registerClass(
class FeatureIndicator extends QuickSettings.SystemIndicator {
    _init() {
        super._init();

        // Create the icon for the indicator
        this._indicator = this._addIndicator();
        this._indicator.icon_name = 'input-keyboard-symbolic';

        // Showing the indicator when the feature is enabled
        this._settings = new Gio.Settings({
            schema_id: 'org.gnome.desktop.a11y.applications',
        });

        this._settings.bind('screen-keyboard-enabled',
            this._indicator, 'visible',
            Gio.SettingsBindFlags.DEFAULT);
        
        // Create the toggle and associate it with the indicator, being sure to
        // destroy it along with the indicator
        this.quickSettingsItems.push(new FeatureToggle());
        
        this.connect('destroy', () => {
            this.quickSettingsItems.forEach(item => item.destroy());
        });
        
        // Add the indicator to the panel and the toggle to the menu
        QuickSettingsMenu._indicators.add_child(this);
        QuickSettingsMenu._addItems(this.quickSettingsItems);
        
    
    }
    
    // To add your toggle above another item, such as Background Apps, add it
    // using the built-in function, then move them afterwards.
    _addItems(items) {
        QuickSettingsMenu._addItems(items);

        for (const item of items) {
            QuickSettingsMenu.menu._grid.set_child_below_sibling(item,
                QuickSettingsMenu._backgroundApps.quickSettingsItems[0]);
        } 
    }
});

class Extension {
    constructor() {
        this._indicator = null;
        
    }
    
    enable() {
        this._indicator = new FeatureIndicator();
        let a11y = Main.panel.statusArea["a11y"];
        if (a11y != null) {
            a11y.container.hide();
        }
    }
    
    disable() {
        this._indicator.destroy();
        this._indicator = null;
        let a11y = Main.panel.statusArea["a11y"];
        if (a11y != null) {
            a11y.container.show();
        }
    }
}

function init() {
    return new Extension();
}
