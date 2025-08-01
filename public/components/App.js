'use strict';

const App = () => {
    return (
        <UserProvider aria-live="polite" aria-atomic="true">
            <Homepage aria-labelledby="homepage-title" />
        </UserProvider>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);