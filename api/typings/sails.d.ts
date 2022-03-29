/*
 * Sails does not currently come with TypeScript support, so in the meantime we
 * manage our own types.
 *
 * The following are based on types by https://github.com/joeherold
 * @see https://gist.github.com/joeherold/cf10ee8a11e145519a7ff960b3ac96a7
 */

declare namespace Sails {
  enum SortOption {
    ASC,
    DESC,
  }
  type SortOptions = keyof typeof SortOption;

  interface Criteria {
    or?: Criteria[];
    [key: string]: CriteriaModifierItem | string | number | boolean | Date | Criteria[] | undefined;
  }

  interface CriteriaWithQueryOptions {
    where: Criteria;
    limit?: number;
    skip?: number;
    sort?: string | { [key: string]: SortOptions }[];
  }

  interface CriteriaModifierItem {
    '<'?: any;
    '<='?: any;
    '>'?: any;
    '>='?: any;
    '!='?: any;
    nin?: any[];
    in?: any[];
    contains?: string;
  }

  interface QueryPromise<T> extends Promise<QueryPromise<T> | any> {
    /**
     * Execute a Waterline query instance using promises.     *
     * @url https://sailsjs.com/documentation/reference/waterline-orm/queries/catch
     * @param filter
     * @param callback
     */
    catch(filter: { name?: string }, callback: (err: Error | undefined) => any): any;
    catch(callback: (err: Error | undefined) => any): any;

    /**
     * Decrypt any auto-encrypted attributes in the records returned for this particular query.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/queries/decrypt
     */
    decrypt(): this;

    /**
     * Execute a Waterline query instance.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/queries/exec
     * @param callback
     */
    exec(callback: (err: Error | undefined, result: any) => any): any;

    /**
     * Capture and intercept the specified error, automatically modifying and re-throwing it, or specifying a new error to be thrown instead. (Still throws.)
     * @url https://sailsjs.com/documentation/reference/waterline-orm/queries/intercept
     * @param filter
     * @param handler
     */
    intercept(filter: string | { code: string }, handler: Function | string): this;
    intercept(handler: Function | string): this;

    /**
     * Set the maximum number of records to retrieve when executing a query instance.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/queries/limit
     * @param maximum
     */
    limit(maximum: number): this;

    /**
     * Provide additional options to Waterline when executing a query instance.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/queries/meta
     * @param options = `{
     *    fetch: false,
     *    cascade: false,
     *    skipAllLifecycleCallbacks: false,
     *    skipRecordVerification: false,
     *    skipExpandingDefaultSelectClause: false,
     *    decrypt: false,
     *    encryptWith: false
     *  }`
     */
    meta(options: {
      fetch?: boolean;
      cascade?: boolean;
      skipAllLifecycleCallbacks?: boolean;
      skipRecordVerification?: boolean;
      skipExpandingDefaultSelectClause?: boolean;
      decrypt?: boolean;
      encryptWith?: string;
    }): this;

    /**
     * Modify a query instance so that, when executed, it will populate child records for the specified collection, optionally filtering by subcriteria. Populate may be called more than once on the same query, as long as each call is for a different association.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/queries/populate
     * @param association
     * @param subcriteria
     */
    populate(association: string, subcriteria?: Criteria): this;

    /**
     * Indicate the number of records to skip before returning the results from executing a query instance.
     * @note If the “skip” value is greater than the number of records matching the query criteria, the query will return an empty array. The .find() method returns a chainable object if you don't supply a callback. This method can be chained to .find() to further filter your results.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/queries/skip
     * @param numRecordsToSkip
     */
    skip(numRecordsToSkip: number): this;

    /**
     * Set the order in which retrieved records should be returned when executing a query instance.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/queries/sort
     * @param sortClaus
     */
    sort(sortClaus: string | { [key: string]: SortOptions }[]): this;

    /**
     * Execute a Waterline query instance using promises.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/queries/then
     * @param callback
     */
    then(callback: (result: any) => any): Promise<any>;

    /**
     * Tolerate (swallow) the specified error, and return a new result value (or undefined) instead. (Don't throw.)
     * @url https://sailsjs.com/documentation/reference/waterline-orm/queries/tolerate
     * @param filter
     * @param handler
     */
    tolerate(filter: string | { code: string }, handler: Function): this;
    tolerate(filter: string | { code: string }): this;
    tolerate(handler: Function): this;

    /**
     * Begin executing a Waterline query instance and return a promise.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/queries/to-promise
     */
    toPromise(): Promise<any>;

    /**
     * Specify an existing database connection to use for this query.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/queries/using-connection
     * @param connection
     */
    usingConnection(connection: any): this;

    /**
     * Specify a where clause for filtering a query.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/queries/where
     * @param whereClause
     */
    where(whereClause: Criteria): this;
  }

  interface MetaOptions {}

  interface ModelFetchPromise<T> extends QueryPromise<T> {
    /**
     * Tell Waterline (and the underlying database adapter) to send back records that were updated/destroyed/created when performing an .update(), .create(), .createEach() or .destroy() query. Otherwise, no data will be returned (or if you are using callbacks, the second argument to the .exec() callback will be undefined).
     * @url https://sailsjs.com/documentation/reference/waterline-orm/queries/fetch
     */
    fetch(): T | T[];
  }

  interface ModelFetchOnePromise<T> extends QueryPromise<T> {
    /**
     * Tell Waterline (and the underlying database adapter) to send back records that were updated/destroyed/created when performing an .update(), .create(), .createEach() or .destroy() query. Otherwise, no data will be returned (or if you are using callbacks, the second argument to the .exec() callback will be undefined).
     * @url https://sailsjs.com/documentation/reference/waterline-orm/queries/fetch
     */
    fetch(): T;
  }

  interface ModelFetchMultiplePromise<T> extends QueryPromise<T> {
    /**
     * Tell Waterline (and the underlying database adapter) to send back records that were updated/destroyed/created when performing an .update(), .create(), .createEach() or .destroy() query. Otherwise, no data will be returned (or if you are using callbacks, the second argument to the .exec() callback will be undefined).
     * @url https://sailsjs.com/documentation/reference/waterline-orm/queries/fetch
     */
    fetch(): T[];
  }

  interface ModelSetPromise<T> extends QueryPromise<T> {
    set(valuesToSet: any): T;
  }

  interface ModelStreamPromise<T> extends QueryPromise<T> {
    eachRecord(callback: (record: DatabaseRecord) => void): this;
    eachBatch(callback: (records: DatabaseRecord[]) => void): this;
  }

  interface ModelMemberPromise<T> extends QueryPromise<T> {
    members(childIds: number[] | string[]): this;
  }

  type DatabaseRecord = {
    id?: number | string;
    [key: string]: any;
  };

  type DatabaseRecordToCreate = {
    id?: number | string;
    [key: string]: any;
  };
  interface Model {
    /**
     * Add one or more existing child records to the specified collection (e.g. the comments of BlogPost #4).
     * @url https://sailsjs.com/documentation/reference/waterline-orm/models/add-to-collection
     * @param parentId
     * @param association
     */
    addToCollection(
      parentId: string | number,
      association: string,
      childIds?: string[] | number[]
    ): ModelMemberPromise<any>;

    /**
     * Archive ("soft-delete") records that match the specified criteria, saving them as new records in the built-in Archive model, then destroying the originals.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/models/archive
     * @param criteria
     */
    archive(criteria: Criteria): ModelFetchPromise<DatabaseRecord | DatabaseRecord[]>;

    /**
     * Archive ("soft-delete") the record that matches the specified criteria, saving it (if it exists) as a new record in the built-in Archive model, then destroying the original.
     * @param criteria
     */
    archiveOne(criteria: Criteria): Promise<DatabaseRecord>;

    /**
     * Get the aggregate mean of the specified attribute across all matching records.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/models/avg
     * @param numericAttrName
     * @param criteria
     */
    avg(numericAttrName: string, criteria: Criteria): number;

    /**
     * Get the total number of records matching the specified criteria.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/models/count
     * @param criteria
     */
    count(criteria: Criteria): number;

    /**
     * Create a record in the database.
     * @info .fetch() to get record
     * @url https://sailsjs.com/documentation/reference/waterline-orm/models/create
     * @param initialValues
     */
    create(initialValues: {}): ModelFetchOnePromise<DatabaseRecord>;

    /**
     * Create a set of records in the database.
     * @info .fetch() to get records
     * @url https://sailsjs.com/documentation/reference/waterline-orm/models/create-each
     * @param initialValues
     */
    createEach(initialValues: {}[]): ModelFetchPromise<DatabaseRecord[] | [] | undefined>;

    /**
     * Destroy records in your database that match the given criteria.
     * @info .fetch() to get records
     * @url https://sailsjs.com/documentation/reference/waterline-orm/models/destroy
     * @param criteria
     */
    destroy(criteria: Criteria): ModelFetchPromise<DatabaseRecord[] | [] | undefined>;

    /**
     * Destroy the record in your database that matches the given criteria, if it exists.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/models/destroy-one
     * @param criteria
     */
    destroyOne(criteria: Criteria): Promise<DatabaseRecord>;

    /**
     * Find records in your database that match the given criteria.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/models/find
     * @param criteria
     */
    find(
      criteria?: Criteria | CriteriaWithQueryOptions,
      populate?: any
    ): QueryPromise<DatabaseRecord[] | undefined>;
    find(
      criteria?: Criteria | CriteriaWithQueryOptions
    ): QueryPromise<DatabaseRecord[] | undefined>;

    /**
     * Attempt to find a particular record in your database that matches the given criteria.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/models/find-one;
     * @example var record = await Something.findOne(criteria);
     * @param criteria
     */
    findOne(criteria: Criteria): QueryPromise<DatabaseRecord>;

    /**
     * Find the record matching the specified criteria. If no such record exists, create one using the provided initial values.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/models/find-or-create
     * @example
     *  var newOrExistingRecord = await Something.findOrCreate(criteria, initialValues);
     *
     * @info or, if you need to know whether a new record was created,
     * @example
     *  Something.findOrCreate(criteria, initialValues)
     *    .exec(function(err, newOrExistingRecord, wasCreated) {
     *    // code
     *    }}
     *
     * @param criteria
     * @param initialValues
     */
    findOrCreate(criteria: Criteria, initialValues: {}): QueryPromise<DatabaseRecord[] | undefined>;

    /**
     * Access the datastore for a particular model.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/models/get-datastore
     */
    getDatastore(): DataStore;

    /**
     * Remove one or more members (e.g. a comment) from the specified collection (e.g. the comments of BlogPost #4).
     * @url https://sailsjs.com/documentation/reference/waterline-orm/models/remove-from-collection
     * @example
     *    await Something.removeFromCollection(parentId, association)
     *      .members(childIds);
     *
     * @param parentId
     * @param association
     */
    removeFromCollection(parentId: number | string, association: string): ModelMemberPromise<any>;

    /**
     * Replace all members of the specified collection (e.g. the comments of BlogPost #4).
     * @url https://sailsjs.com/documentation/reference/waterline-orm/models/replace-collection
     * @param parentId
     * @param association
     */
    replaceCollection(parentId: number | string, association: string): ModelMemberPromise<any>;

    /**
     * Stream records from your database to be consumed one at a time or in batches, without first having to buffer the entire result set in memory.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/models/stream
     * @param criteria
     */
    stream(criteria: Criteria): ModelSetPromise<any>;

    /**
     * Get the aggregate sum of the specified attribute across all matching records.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/models/sum
     * @param numericAttrName
     * @param criteria
     */
    sum(numericAttrName: string, criteria?: Criteria): number;

    /**
     * Update all records matching criteria.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/models/update
     * @param criteria
     */
    update(criteria: Criteria): ModelSetPromise<DatabaseRecord[]>;

    /**
     * Update the record that matches the given criteria, if such a record exists.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/models/update-one
     * @param criteria
     */
    updateOne(criteria: Criteria): ModelSetPromise<DatabaseRecord>;

    /**
     * Verify that a value would be valid for a given attribute, then return it, loosely coerced.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/models/validate
     * @param atrrName
     * @param value
     */
    validate(atrrName: string, value: any): void;

    // enable other private methods.
    [key: string]: any;
  }

  interface DataStore {
    /**
     * The generic, stateless, low-level driver for this datastore (if supported by the adapter).
     * @url https://sailsjs.com/documentation/reference/waterline-orm/datastores/driver
     */
    driver: any;

    /**
     * The live connection manager for this datastore.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/datastores/manager
     */
    manager: any;

    /**
     * Lease a new connection from the datastore for use in running multiple queries on the same connection (i.e. so that the logic provided in during can reuse the db connection).
     * @url https://sailsjs.com/documentation/reference/waterline-orm/datastores/lease-connection
     * @param during A procedural parameter that Sails will call automatically when a connection has been obtained and made ready for you. It will receive the arguments specified in the "During" usage table below.
     * @param db Your newly-leased database connection. (See .usingConnection() for more information on what to do with this.)
     */
    leaseConnection(during: (db: any) => any): any;

    /**
     * Execute a raw SQL query using this datastore.
     * @url https://sailsjs.com/documentation/reference/waterline-orm/datastores/send-native-query
     */
    sendNativeQuery(sql: string, valuesToEscape?: any[]): Promise<any>;

    /**
     * Fetch a preconfigured, deferred object hooked up to the sails-mysql or sails-postgresql adapter (and consequently the appropriate driver).
     * @url Fetch a preconfigured, deferred object hooked up to the sails-mysql or sails-postgresql adapter (and consequently the appropriate driver).
     * @param during
     */
    transaction(during: (db: any) => any): any;
  }

  interface Controller {
    [key: string]: (req: Sails.Request, res: Sails.Response, ...rest: any) => void;
  }

  type LoggingMethods = {
    error: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    debug: (...args: any[]) => void;
    info: (...args: any[]) => void;
    verbose: (...args: any[]) => void;
    silly: (...args: any[]) => void;
    [key: string]: (...args: any[]) => void;
    (...args: any[]): void;
  };

  type DirectLoggingMethod = (args: any) => void;

  interface GlobalSailsApplication {
    models: {
      [key: string]: Model;
    };

    log: LoggingMethods;

    [key: string]: any;
  }
}

/**
 * DECLARE THE sails VARIABLE
 */
declare var sails: Sails.GlobalSailsApplication;
