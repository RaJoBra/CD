import { Document, Schema, model } from 'mongoose';
import {MAX_RATING, autoIndex, optimistic } from '../../shared';
import {isISBN, isURL, isUUID } from 'validator';
import { kStringMaxLength } from 'buffer';

export const schema = new Schema (
    {
        _id: {type: String },
        title: {type: String, required: true, unique: true},
        rating: Number,
        art: String,
        verlag: { type: String, required: true},
        preis: { type: String, required: true},
        rabatt: Number,
        lieferbar: Boolean,
        datum: Date,
        homepage: String,
        schlagwoerter: {type: [String], index: true },
        autoren: [Schema.Types.Mixed],
    },
    {
        toJSON: {getters: true, virtuals: false },
        //Fehlder die automatisch gepflegt werden bei createdAd und updatedAD
        timestamps: true,
        autoIndex,
    },
);

schema.plugin(optimistic);

export const Spiel = model('Buch', schema);

const isPresent = (obj: string | undefined ) =>
    obj !== undefined && obj !== null;
const isEmpty =(obj: string | undefined ) =>
    obj === undefined || obj === null || obj === '';

export const validateBuch = (buch: any) => {
    const err: any = {};
    const { titel, art, rating, verlag, isbn, homepage } = buch;

    const buchDocument = buch as Document;
    if (!buchDocument.isNew && !isUUID(buchDocument._id)){
        err.id = 'Das Buch hat eine ungueltige ID.';
    }

    if (isEmpty(titel)){
        err.titel = 'Ein Buch muss einen Titel haben.';
    } else if (!/^\w.*/u.test(titel)) {
        err.titel =
            'Ein Buchtitle muss mit einem Buchstaben, einer Ziffer oder _ beginnen';   
    }

    if (isEmpty(art)){
        err.art = 'Die Art eines Buch muss gesetzt sein';
    } else if (art !== 'KINDLE' && buch.art !=='DRUCKAUSGABE'){
        err.art = 'Die Art eines Buches muss KINDLE oder DRUCKAUSGABE sein.';
    }

    if ( isPresent(rating) && (rating <0 || rating > MAX_RATING)) {
            err.rating = `${rating} ist keine gueltige Bewertung.`;       
    }

    if (isEmpty(verlag)){
        err.verlag = 'Der Verlag des Buches muss gesetzt sein.';
    } else if (verlag !== 'IWI_VERLAG' && verlag !== 'HSKA_VERLAG'){
        err.verlag = 
            'Der Verlag eines Buches muss IWI_VERLAG oder HSKA_VERLAG sein.';
    }

    if(isPresent(homepage) && !isURL(homepage)){
        err.homepage = `${homepage} ist keine gueltige URL.`;
    }

    return Object.keys(err).length === 0 ? undefined : err;
}; 
