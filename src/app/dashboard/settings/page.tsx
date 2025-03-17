import { TestNotificationsButton } from './components/TestNotificationsButton';

// ... existing code ...

      {/* Add this section wherever appropriate in your settings page */}
      <div className="mt-10 border-t pt-8">
        <h2 className="text-lg font-medium mb-4">Developer Tools</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Test Notifications</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create test notifications to see how they appear in the UI.
            </p>
            <TestNotificationsButton />
          </div>
        </div>
      </div> 