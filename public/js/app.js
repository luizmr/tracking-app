// TimersDashboard: Parent container
//   – EditableTimerList: Displays a list of timer containers
//      * EditableTimer: Displays either a timer or a timer’s edit form
//         · Timer: Displays a given timer
//         · TimerForm: Displays a given timer’s edit form
//  – ToggleableTimerForm: Displays a form to create a new timer
//      * TimerForm (not displayed): Displays a new timer’s create form

// DETERMINE IN WHICH COMPONENT EACH PIECE OF STATE SHOULD LIVE
// For each piece of state:
// • Identify every component that renders something based on that state.
// • Find a common owner component (a single component above all the components
// that need the state in the hierarchy).
// • Either the common owner or another component higher up in the hierarchy
// should own the state.
// • If you can’t find a component where it makes sense to own the state, create a new
// component simply for holding the state and add it somewhere in the hierarchy
// above the common owner component.

// STATE SUMMARY
// Timer data will be owned and managed by TimersDashboard
// Each EditableTimer will manage the state of its timer edit Form
// The ToggleableTimerForm will manage the state of its form visibility
// State is managed in some select parent components and then the data flows down through children as props
// If state is updated, the component managing that state re-renders, causing any of its children to re-render, and on and on down the chain

// SERVER API
// Write operations -> a timer is created, updated, deleted, started, stopped
// Read operations -> requesting all of the timers from the server
// React only communicates with the JSON endpoints

class TimersDashboard extends React.Component {
    // hard-code initial states
    state = {
        timers: [],
    };

    // every 5s it will refresh data from server
    componentDidMount() {
        this.loadTimersFromServer();
        setInterval(this.loadTimersFromServer, 5000);
    }

    // get timers from server and setState timer with data from server
    loadTimersFromServer = () => {
        client.getTimers((serverTimers) =>
            this.setState({ timers: serverTimers })
        );
    };

    handleCreateFormSubmit = (timer) => {
        this.createTimer(timer);
    };

    handleEditFormSubmit = (attrs) => {
        this.updateTimer(attrs);
    };

    handleTrashClick = (timerId) => {
        this.deleteTimer(timerId);
    };

    handleStartClick = (timerId) => {
        this.startTimer(timerId);
    };
    handleStopClick = (timerId) => {
        this.stopTimer(timerId);
    };

    // returns title and project, with a generated id
    createTimer = (timer) => {
        const t = helpers.newTimer(timer);

        this.setState({
            timers: this.state.timers.concat(t),
        });

        client.createTimer(t);
    };

    // if timer's id matches that of the form submitted, it will return a new object
    // that contains the timer with the updated attributes, otherwise, it will just return the original timer
    updateTimer = (attrs) => {
        this.setState({
            timers: this.state.timers.map((timer) => {
                if (timer.id === attrs.id) {
                    return Object.assign({}, timer, {
                        title: attrs.title,
                        project: attrs.project,
                    });
                } else {
                    return timer;
                }
            }),
        });

        client.updateTimer(attrs);
    };

    deleteTimer = (timerId) => {
        this.setState({
            timers: this.state.timers.filter((t) => t.id !== timerId),
        });

        client.deleteTimer({ id: timerId });
    };

    // when startTimer gets the same id number, it sets the property runningSince to the current time
    startTimer = (timerId) => {
        const now = Date.now();
        this.setState({
            timers: this.state.timers.map((timer) => {
                if (timer.id === timerId) {
                    return Object.assign({}, timer, {
                        runningSince: now,
                    });
                } else {
                    return timer;
                }
            }),
        });

        // post the data on server using a function from client.js
        client.startTimer({ id: timerId, start: now });
    };

    // when it gets the same id number when called, calculates the amount of time
    // that the timer has been running since it was started
    // it adds this amount to elapsed and sets runningSince to null, stopping the timer
    stopTimer = (timerId) => {
        const now = Date.now();
        this.setState({
            timers: this.state.timers.map((timer) => {
                if (timer.id === timerId) {
                    const lastElapsed = now - timer.runningSince;
                    return Object.assign({}, timer, {
                        elapsed: timer.elapsed + lastElapsed,
                        runningSince: null,
                    });
                } else {
                    return timer;
                }
            }),
        });

        // post the data on server using a function from client.js
        client.stopTimer({ id: timerId, stop: now });
    };
    // it can handle modifications from EditableTimerList and creates from ToggleableTimerForm, mutating the state
    // the new state will flow downward through EditableTimerList
    render() {
        return (
            <div className="ui three column centered grid">
                <div className="column">
                    {/* component renders its two child components  */}
                    <EditableTimerList
                        timers={this.state.timers}
                        onFormSubmit={this.handleEditFormSubmit}
                        onTrashClick={this.handleTrashClick}
                        onStartClick={this.handleStartClick}
                        onStopClick={this.handleStopClick}
                    />
                    {/* pass the functions as prop */}
                    {/* isOpen determine to render a "+" or TimerForm */}
                    {/* isOpen is stateful -> data is defined here, it changes over time, and cannot be computed from other state or props */}
                    {/* <ToggleableTimerForm isOpen={true} /> */}
                    <ToggleableTimerForm
                        onFormSubmit={this.handleCreateFormSubmit}
                    />
                </div>
            </div>
        );
    }
}

class EditableTimerList extends React.Component {
    render() {
        // using map to build a list of EditableTimer components
        const timers = this.props.timers.map((timer) => (
            <EditableTimer
                key={timer.id}
                id={timer.id}
                title={timer.title}
                project={timer.project}
                elapsed={timer.elapsed}
                runningSince={timer.runningSince}
                onFormSubmit={this.props.onFormSubmit}
                onTrashClick={this.props.onTrashClick}
                onStartClick={this.props.onStartClick}
                onStopClick={this.props.onStopClick}
            />
        ));
        return (
            <div id="timers">
                {/* dynamic component */}
                {timers}
                {/* two components inside */}
                {/* timer properties -> stateful -> data defined here, changes over time and cannot be computed from other state or props */}
                {/* <EditableTimer
                    key={timer.id}
                    id={timer.id}
                    title={timer.title}
                    project={timer.project}
                    elapsed={timer.elapsed}
                    runningSince={timer.runningSince}
                    // editFormOpen={false}
                />
                <EditableTimer
                    title="Learn Extreme Ironing"
                    project="Web Domination"
                    elapsed="1823620"
                    runningSince={null}
                    editFormOpen={true}
                /> */}
                {/* editFormOpen - will say which sub-component should render */}
            </div>
        );
    }
}

class EditableTimer extends React.Component {
    // editFormOpen for a given timer -> stateful
    // data is defined here, changes over time and cannot be computed from other state or props
    state = {
        editFormOpen: false,
    };

    //
    handleEditClick = () => {
        this.openForm();
    };

    handleFormClose = () => {
        this.closeForm();
    };
    handleSubmit = (timer) => {
        this.props.onFormSubmit(timer);
        this.closeForm();
    };
    openForm = () => {
        this.setState({ editFormOpen: true });
    };
    closeForm = () => {
        this.setState({ editFormOpen: false });
    };

    render() {
        if (this.state.editFormOpen) {
            return (
                <TimerForm
                    id={this.props.id}
                    title={this.props.title}
                    project={this.props.project}
                    onFormSubmit={this.handleSubmit}
                    onFormClose={this.handleFormClose}
                />
            );
        } else {
            return (
                <Timer
                    id={this.props.id}
                    title={this.props.title}
                    project={this.props.project}
                    elapsed={this.props.elapsed}
                    runningSince={this.props.runningSince}
                    onEditClick={this.handleEditClick}
                    onTrashClick={this.props.onTrashClick}
                    onStartClick={this.props.onStartClick}
                    onStopClick={this.props.onStopClick}
                />
            );
        }
    }
}

// Forms are special state managers in their own right -> stateful
// all modificatoin that are made to a component should be handled by React and kept in state
// Outside of TimerForm, our stateful data was identified:
// list of timers and properties of each timer
// whether or not the edit form of a timer is open
// whether or not the create form is open
class TimerForm extends React.Component {
    // used for editing (this.props..) or creating (''), blank string -> to not get undefined
    state = {
        title: this.props.title || "",
        project: this.props.project || "",
    };

    // both functions will modify their respective properties in state
    handleTitleChange = (e) => {
        this.setState({ title: e.target.value });
    };
    handleProjectChange = (e) => {
        this.setState({ project: e.target.value });
    };

    // Calls onFormSubmit function and then passes a data object
    handleSubmit = () => {
        this.props.onFormSubmit({
            id: this.props.id,
            title: this.state.title,
            project: this.state.project,
        });
    };

    render() {
        // if there is a title/id, submitText shows update, otherwise shows Create
        const submitText = this.props.id ? "Update" : "Create";
        return (
            <div className="ui centered card">
                <div className="content">
                    <div className="ui form">
                        <div className="field">
                            <label>Title</label>
                            <input
                                type="text"
                                value={this.state.title}
                                onChange={this.handleTitleChange}
                            />
                            {/* value -> when editing, this sets the field to the current values of the timer as desired */}
                        </div>
                        <div className="Field">
                            <label>Project</label>
                            <input
                                type="text"
                                value={this.state.project}
                                onChange={this.handleProjectChange}
                            />
                            {/* onChange -> used for inputs in React, to call a function whenever the input field is changed */}
                        </div>
                        <div className="ui two bottom attached buttons">
                            <button
                                className="ui basic blue button"
                                onClick={this.handleSubmit}
                            >
                                {submitText}
                            </button>
                            <button
                                className="ui basic red button"
                                onClick={this.props.onFormClose}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class Timer extends React.Component {
    componentDidMount() {
        this.forceUpdateInterval = setInterval(() => this.forceUpdate(), 50); // will invoke forceUpdate every 50ms
    }

    // clearInterval to stop the interval of this.forceUpdateInterval
    // componentWillUnmount is called before component is removed from the app
    // to ensure we do not continue calling forceUpdate() after the timer has been removed
    componentWillUnmount() {
        clearInterval(this.forceUpdateInterval);
    }

    // action buttons start/stop
    handleStartClick = () => {
        this.props.onStartClick(this.props.id);
    };

    handleStopClick = () => {
        this.props.onStopClick(this.props.id);
    };

    handleTrashClick = () => {
        this.props.onTrashClick(this.props.id);
    };

    render() {
        // elapsed is in ms
        const elapsedString = helpers.renderElapsedString(
            this.props.elapsed,
            this.props.runningSince
        );
        return (
            <div className="ui centered card">
                <div className="content">
                    {/* timer properties -> not stateful -> properties are passed down from the parent */}
                    <div className="header">{this.props.title}</div>
                    <div className="meta">{this.props.project}</div>
                    <div className="center aligned description">
                        <h2>{elapsedString}</h2>
                    </div>
                    <div className="extra content">
                        <span
                            className="right floated edit icon"
                            onClick={this.props.onEditClick}
                        >
                            <i className="edit icon" />
                        </span>
                        <span
                            className="right floated trash icon"
                            onClick={this.handleTrashClick}
                        >
                            <i className="trash icon" />
                        </span>
                    </div>
                </div>

                {/* component to propagate two events */}
                {/* !! returns false when runningSince is null */}
                <TimerActionButton
                    timerIsRunning={!!this.props.runningSince}
                    onStartClick={this.handleStartClick}
                    onStopClick={this.handleStopClick}
                />
            </div>
        );
    }
}

class ToggleableTimerForm extends React.Component {
    // if isOpen is true, returns TimerForm, otherwise, returns the button +
    state = {
        isOpen: false,
    };

    // function will toggle the state of the form to open
    // arrow function automatically binds "this"
    handleFormOpen = () => {
        this.setState({ isOpen: true });
    };

    handleFormClose = () => {
        this.setState({ isOpen: false });
    };

    handleFormSubmit = (timer) => {
        this.props.onFormSubmit(timer);
        this.setState({ isOpen: false });
    };

    render() {
        if (this.state.isOpen) {
            // title and project field will be rendered empty
            return (
                <TimerForm
                    onFormSubmit={this.handleFormSubmit}
                    onFormClose={this.handleFormClose}
                />
            );
        } else {
            return (
                <div className="ui basic content center aligned segment">
                    <button
                        className="ui basic button icon"
                        onClick={this.handleFormOpen}
                    >
                        <i className="plus icon" />
                    </button>
                </div>
            );
        }
    }
}

class TimerActionButton extends React.Component {
    render() {
        // while there is runningSince, it returns true
        // when is null, returns false, then stops and shows Start
        if (this.props.timerIsRunning) {
            return (
                <div
                    className="ui bottom attached red basic button"
                    onClick={this.props.onStopClick}
                >
                    Stop
                </div>
            );
        } else {
            return (
                <div
                    className="ui bottom attached green basic button"
                    onClick={this.props.onStartClick}
                >
                    Start
                </div>
            );
        }
    }
}

ReactDOM.render(<TimersDashboard />, document.getElementById("content"));
