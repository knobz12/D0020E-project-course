package se.ltu.softwareengineering.game;

import com.google.gson.reflect.TypeToken;
import se.ltu.softwareengineering.concept.Concept;
import se.ltu.softwareengineering.concept.Monster;
import se.ltu.softwareengineering.concept.card.EvolutionCard;
import se.ltu.softwareengineering.concept.card.StoreCard;
import se.ltu.softwareengineering.exception.KoTIOException;
import se.ltu.softwareengineering.tool.Resource;
import se.ltu.softwareengineering.tool.ResourceLoader;

import java.util.Set;

public abstract class ConceptLoader {
    public static Set<Monster> loadMonsters() throws KoTIOException {
        return loadConcepts(Resource.Monsters, Monster.class);
    }

    public static Set<StoreCard> loadStoreCards() throws KoTIOException {
        return loadConcepts(Resource.StoreCards, StoreCard.class);
    }

    public static Set<EvolutionCard> loadEvolutionCards() throws KoTIOException {
        return loadConcepts(Resource.EvolutionCards, EvolutionCard.class);
    }

    private static <T extends Concept> Set<T> loadConcepts(Resource resource, Class<T> conceptClass) throws KoTIOException {
        return ResourceLoader.loadData(resource, TypeToken.getParameterized(Set.class, conceptClass).getType());
    }
}
