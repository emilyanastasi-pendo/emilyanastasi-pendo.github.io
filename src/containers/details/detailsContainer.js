import { connect } from 'react-redux';
import Details from '../../components/details/details.js';
import {
    updateDetailsInputValue,
    addPostToTimeline,
    fetchDetails
} from '../../actions/detailActions.js';
import { changePageTitle } from '../../actions';
import { withRouter } from 'react-router-dom';

// inputValue: Value that is inside the text area
// timelinePosts: should be self explanatory
// info: this is the object that is currently in need for the quick info an additional info
// 		 logic for contacts/acc/opps is prebuilt into system
// loading: boolean
const mapStateToProps = (state) => {
    return {
        inputValue: state.TimelineReducer.inputValue,
        timelinePosts: state.TimelineReducer.timelinePosts,
        info: state.DetailsInformationReducer.info,
        loading: state.DetailsInformationReducer.loading
    };
};

// onDetailsChange: Update the input value in the state when typed into the textarea
// onDetailsSubmit: Add a post to the timeline by appending to the timeline posts object
// onDetailsLoad: get the details based off the URL and the UUID for the restdb
// changePageTitle: obvious
const mapDispatchToProps = (dispatch) => {
    return {
        onDetailsChange: (text) => {
            dispatch(updateDetailsInputValue(text));
        },
        onDetailsSubmit: (icon, text) => {
            dispatch(addPostToTimeline(icon, text));

            // Pendo Track Event: an activity entry was added to the record's timeline.
            // The shared #submit-btn can't tell which activity tab was used or whether
            // the entry was empty, so fire here only for non-empty entries.
            // The entry text itself is never sent (may contain PII).
            const trimmedText = typeof text === 'string' ? text.trim() : '';
            if (trimmedText && window.pendo && typeof window.pendo.track === 'function') {
                const pathname = window.location.pathname;
                try {
                    window.pendo.track('timeline_activity_logged', {
                        activity_type: String(icon || '')
                            .trim()
                            .slice(0, 100),
                        record_type: pathname.split('/')[1],
                        is_new_record: pathname.includes('new'),
                        entry_length: trimmedText.length
                    });
                } catch (e) {
                    // Never let tracking failures break the timeline flow
                }
            }
        },
        onDetailsLoad: (url) => {
            localStorage.clear();
            dispatch(fetchDetails(url));
        },
        onPageUpdate: (text) => {
            dispatch(changePageTitle(text));
        }
    };
};

const FinalDetails = withRouter(connect(mapStateToProps, mapDispatchToProps)(Details));

export default FinalDetails;
